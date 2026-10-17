import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { checkAdminAuth } from "@/lib/admin-auth";
import PushSubscription from "@/lib/models/PushSubscription";
import NotificationCampaign from "@/lib/models/NotificationCampaign";
import Visitor from "@/lib/models/Visitor";
import Movie from "@/lib/models/Movie";
import CountModel from "@/lib/models/Count";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const auth = await checkAdminAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [
      totalVisitors,
      totalSubscriptions,
      activeSubscriptions,
      inactiveSubscriptions,
      grantedPermissions,
      totalCampaigns,
      totalMovies,
      countDoc,
      recentCampaigns,
      deliveryAggregation,
    ] = await Promise.all([
      Visitor.countDocuments().catch(() => 0),
      PushSubscription.countDocuments().catch(() => 0),
      PushSubscription.countDocuments({ status: "active" }).catch(() => 0),
      PushSubscription.countDocuments({ status: { $in: ["inactive", "expired"] } }).catch(() => 0),
      PushSubscription.countDocuments({ permissionState: "granted" }).catch(() => 0),
      NotificationCampaign.countDocuments().catch(() => 0),
      Movie.countDocuments().catch(() => 0),
      CountModel.findOne().lean().catch(() => null),
      NotificationCampaign.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
        .catch(() => []),
      NotificationCampaign.aggregate([
        {
          $group: {
            _id: null,
            totalSuccess: { $sum: "$successfulPushRequests" },
            totalFailed: { $sum: "$failedPushRequests" },
            totalTargets: { $sum: "$totalTargets" },
          },
        },
      ]).catch(() => []),
    ]);

    const aggregateStats = deliveryAggregation[0] || {
      totalSuccess: 0,
      totalFailed: 0,
      totalTargets: 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        visitors: {
          total: totalVisitors,
          description: "Total known visitors from database",
        },
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptions,
          inactive: inactiveSubscriptions,
          grantedPermissions,
        },
        broadcasts: {
          total: totalCampaigns,
          totalTargets: aggregateStats.totalTargets,
          successfulDeliveries: aggregateStats.totalSuccess,
          failedDeliveries: aggregateStats.totalFailed,
        },
        siteStats: {
          totalMovies,
          countData: countDoc ? { count: countDoc.count, random: countDoc.random } : null,
        },
        recentCampaigns,
      },
    });
  } catch (error) {
    console.error("API /api/admin/stats error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
