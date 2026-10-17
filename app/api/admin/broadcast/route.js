import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { checkAdminAuth, isRateLimited } from "@/lib/admin-auth";
import PushSubscription from "@/lib/models/PushSubscription";
import NotificationCampaign from "@/lib/models/NotificationCampaign";
import NotificationDelivery from "@/lib/models/NotificationDelivery";
import { sendWebPush, isValidSafeUrl } from "@/lib/webpush";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    // 1. Verify Admin Authentication
    const auth = await checkAdminAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limit: max 6 broadcasts per minute
    if (isRateLimited(`broadcast:${auth.user}`, 6, 60000)) {
      return NextResponse.json(
        { error: "Broadcast rate limit reached. Please wait a minute." },
        { status: 429 }
      );
    }

    // 3. Parse & Validate input
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const title = String(body.title || "").trim();
    const message = String(body.message || "").trim();
    const destinationUrl = String(body.destinationUrl || "").trim();
    const imageUrl = String(body.imageUrl || "").trim();
    const actionLabel = String(body.actionLabel || "Watch Now").trim();

    if (!title) {
      return NextResponse.json({ error: "Notification Title is required." }, { status: 400 });
    }

    if (!destinationUrl) {
      return NextResponse.json({ error: "Direct Link URL is required." }, { status: 400 });
    }

    if (!isValidSafeUrl(destinationUrl)) {
      return NextResponse.json(
        { error: "Direct Link URL must be a valid HTTP or HTTPS URL (no javascript: schemes allowed)." },
        { status: 400 }
      );
    }

    if (imageUrl && !isValidSafeUrl(imageUrl)) {
      return NextResponse.json(
        { error: "Image URL must be a valid HTTP or HTTPS URL." },
        { status: 400 }
      );
    }

    await connectDB();

    // 4. Create Campaign in DB
    const campaign = await NotificationCampaign.create({
      title,
      message,
      imageUrl,
      destinationUrl,
      actionLabel,
      createdBy: auth.user || "admin",
      status: "processing",
    });

    // 5. Select all active subscriptions
    const subscriptions = await PushSubscription.find({ status: "active" });
    const totalTargets = subscriptions.length;
    campaign.totalTargets = totalTargets;

    if (totalTargets === 0) {
      campaign.status = "completed";
      campaign.completedAt = new Date();
      await campaign.save();

      return NextResponse.json({
        success: true,
        campaignId: campaign._id,
        totalTargets: 0,
        successfulPushRequests: 0,
        failedPushRequests: 0,
        message: "Campaign created. No active subscriptions to broadcast to at this time.",
      });
    }

    // 6. Push payload
    const pushPayload = {
      title,
      body: message || "Tap to view new video on P9X9",
      icon: "/favicon.png",
      badge: "/favicon.png",
      image: imageUrl || undefined,
      actionLabel,
      data: {
        url: destinationUrl,
        campaignId: String(campaign._id),
      },
      actions: [
        {
          action: "open",
          title: actionLabel || "Watch Now",
        },
      ],
    };

    // 7. Process push deliveries in bounded batches (25 concurrent)
    const BATCH_SIZE = 25;
    let successfulCount = 0;
    let failedCount = 0;
    const deliveryLogs = [];

    for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
      const batch = subscriptions.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.allSettled(
        batch.map(async (sub) => {
          try {
            const result = await sendWebPush(sub, pushPayload);
            return {
              sub,
              success: true,
              statusCode: result?.statusCode || 201,
            };
          } catch (err) {
            return {
              sub,
              success: false,
              statusCode: err?.statusCode || 500,
              error: err?.message || "Unknown error",
            };
          }
        })
      );

      for (const res of batchResults) {
        if (res.status === "fulfilled") {
          const item = res.value;
          if (item.success) {
            successfulCount++;
            deliveryLogs.push({
              campaignId: campaign._id,
              subscriptionId: item.sub._id,
              endpoint: item.sub.endpoint,
              status: "success",
              statusCode: item.statusCode,
              attemptCount: 1,
            });
            // Update lastSuccessfulSendAt asynchronously
            PushSubscription.updateOne(
              { _id: item.sub._id },
              { $set: { lastSuccessfulSendAt: new Date() } }
            ).exec();
          } else {
            failedCount++;
            const isExpired = item.statusCode === 410 || item.statusCode === 404;
            const isBadReq = item.statusCode === 400;

            deliveryLogs.push({
              campaignId: campaign._id,
              subscriptionId: item.sub._id,
              endpoint: item.sub.endpoint,
              status: isExpired ? "expired" : "failed",
              statusCode: item.statusCode,
              error: item.error,
              attemptCount: 1,
            });

            // Mark expired or inactive if reported by push service
            if (isExpired) {
              PushSubscription.updateOne(
                { _id: item.sub._id },
                { $set: { status: "expired" }, $inc: { failureCount: 1 } }
              ).exec();
            } else if (isBadReq) {
              PushSubscription.updateOne(
                { _id: item.sub._id },
                { $set: { status: "inactive" }, $inc: { failureCount: 1 } }
              ).exec();
            } else {
              PushSubscription.updateOne(
                { _id: item.sub._id },
                { $inc: { failureCount: 1 } }
              ).exec();
            }
          }
        } else {
          failedCount++;
        }
      }
    }

    // 8. Bulk insert delivery records
    if (deliveryLogs.length > 0) {
      await NotificationDelivery.insertMany(deliveryLogs, { ordered: false }).catch((err) => {
        console.warn("Delivery log insert notice:", err.message);
      });
    }

    // 9. Update campaign record
    campaign.successfulPushRequests = successfulCount;
    campaign.failedPushRequests = failedCount;
    campaign.status =
      failedCount === 0
        ? "completed"
        : successfulCount === 0
        ? "failed"
        : "partial";
    campaign.completedAt = new Date();
    await campaign.save();

    return NextResponse.json({
      success: true,
      campaignId: campaign._id,
      totalTargets,
      successfulPushRequests: successfulCount,
      failedPushRequests: failedCount,
      status: campaign.status,
      message: `Broadcast finished: ${successfulCount} accepted, ${failedCount} failed out of ${totalTargets} subscribers.`,
    });
  } catch (error) {
    console.error("API /api/admin/broadcast error:", error);
    return NextResponse.json(
      { error: "Broadcast error: " + (error.message || "Server error") },
      { status: 500 }
    );
  }
}
