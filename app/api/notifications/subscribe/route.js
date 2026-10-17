import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PushSubscription from "@/lib/models/PushSubscription";
import { isRateLimited } from "@/lib/admin-auth";
import { isValidSafeUrl } from "@/lib/webpush";

export async function POST(request) {
  try {
    // 1. IP rate limiting: max 30 subscriptions/min per IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (isRateLimited(`sub:${ip}`, 30, 60000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.subscription) {
      return NextResponse.json(
        { error: "Invalid subscription payload" },
        { status: 400 }
      );
    }

    const { endpoint, keys } = body.subscription;
    const source = typeof body.source === "string" ? body.source.slice(0, 100) : "web";
    const userAgent = request.headers.get("user-agent")?.slice(0, 255) || "";

    if (!endpoint || typeof endpoint !== "string" || !isValidSafeUrl(endpoint)) {
      return NextResponse.json(
        { error: "Invalid push endpoint" },
        { status: 400 }
      );
    }

    if (!keys || typeof keys.p256dh !== "string" || typeof keys.auth !== "string") {
      return NextResponse.json(
        { error: "Invalid push encryption keys" },
        { status: 400 }
      );
    }

    await connectDB();

    // Upsert subscription
    const updated = await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        endpoint,
        keys: {
          p256dh: keys.p256dh.trim(),
          auth: keys.auth.trim(),
        },
        status: "active",
        permissionState: "granted",
        source,
        userAgent,
        failureCount: 0,
        updatedAt: new Date(),
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Push subscription successfully registered",
      id: updated._id,
    });
  } catch (error) {
    console.error("API /api/notifications/subscribe error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
