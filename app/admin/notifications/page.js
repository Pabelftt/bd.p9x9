import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import { checkAdminAuth } from "@/lib/admin-auth";
import PushSubscription from "@/lib/models/PushSubscription";
import NotificationCampaign from "@/lib/models/NotificationCampaign";
import Visitor from "@/lib/models/Visitor";
import AdminNotificationsClient from "@/components/AdminNotificationsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Web Push Notifications - Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminNotificationsPage() {
  const auth = await checkAdminAuth();
  if (!auth.authenticated) {
    redirect("/admin/login");
  }

  await connectDB();

  const [
    totalVisitors,
    totalSubscriptions,
    activeSubscriptions,
    inactiveSubscriptions,
    grantedPermissions,
    totalCampaigns,
    campaignsList,
    deliveryAggregation,
  ] = await Promise.all([
    Visitor.countDocuments().catch(() => 0),
    PushSubscription.countDocuments().catch(() => 0),
    PushSubscription.countDocuments({ status: "active" }).catch(() => 0),
    PushSubscription.countDocuments({ status: { $in: ["inactive", "expired"] } }).catch(() => 0),
    PushSubscription.countDocuments({ permissionState: "granted" }).catch(() => 0),
    NotificationCampaign.countDocuments().catch(() => 0),
    NotificationCampaign.find()
      .sort({ createdAt: -1 })
      .limit(20)
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

  const aggregate = deliveryAggregation[0] || {
    totalSuccess: 0,
    totalFailed: 0,
    totalTargets: 0,
  };

  const initialStats = {
    visitors: { total: totalVisitors },
    subscriptions: {
      total: totalSubscriptions,
      active: activeSubscriptions,
      inactive: inactiveSubscriptions,
      grantedPermissions,
    },
    broadcasts: {
      total: totalCampaigns,
      totalTargets: aggregate.totalTargets,
      successfulDeliveries: aggregate.totalSuccess,
      failedDeliveries: aggregate.totalFailed,
    },
  };

  // Convert mongoose objects to plain JSON for client component
  const initialCampaigns = JSON.parse(JSON.stringify(campaignsList));

  return (
    <AdminNotificationsClient
      initialStats={initialStats}
      initialCampaigns={initialCampaigns}
      initialSubscriptions={[]}
    />
  );
}
