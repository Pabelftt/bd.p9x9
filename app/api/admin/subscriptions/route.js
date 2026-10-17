import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { checkAdminAuth } from "@/lib/admin-auth";
import PushSubscription from "@/lib/models/PushSubscription";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const auth = await checkAdminAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "15", 10)));
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    await connectDB();

    const query = {};
    if (status && ["active", "inactive", "expired"].includes(status)) {
      query.status = status;
    }

    const [docs, total, activeCount, inactiveCount, expiredCount] = await Promise.all([
      PushSubscription.find(query)
        .select("-keys") // Exclude private subscription keys
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PushSubscription.countDocuments(query),
      PushSubscription.countDocuments({ status: "active" }),
      PushSubscription.countDocuments({ status: "inactive" }),
      PushSubscription.countDocuments({ status: "expired" }),
    ]);

    // Mask endpoints for admin privacy: show provider domain instead of full private token
    const subscriptions = docs.map((sub) => {
      let providerDomain = "push-service";
      try {
        const u = new URL(sub.endpoint);
        providerDomain = u.hostname;
      } catch {}

      return {
        _id: sub._id,
        provider: providerDomain,
        status: sub.status,
        permissionState: sub.permissionState,
        source: sub.source,
        failureCount: sub.failureCount,
        lastSuccessfulSendAt: sub.lastSuccessfulSendAt,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      subscriptions,
      counts: {
        totalAll: activeCount + inactiveCount + expiredCount,
        active: activeCount,
        inactive: inactiveCount,
        expired: expiredCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("API /api/admin/subscriptions error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
