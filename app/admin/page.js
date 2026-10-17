import { redirect } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/db";
import { checkAdminAuth } from "@/lib/admin-auth";
import PushSubscription from "@/lib/models/PushSubscription";
import NotificationCampaign from "@/lib/models/NotificationCampaign";
import Visitor from "@/lib/models/Visitor";
import Movie from "@/lib/models/Movie";
import CountModel from "@/lib/models/Count";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard - Overview",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardPage() {
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
      .limit(6)
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

  const deliveryRate =
    aggregate.totalTargets > 0
      ? Math.round((aggregate.totalSuccess / aggregate.totalTargets) * 100)
      : 100;

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Dashboard Overview</h1>
          <p className="admin-page-desc">
            System status, visitor metrics, and Web Push Notification activity.
          </p>
        </div>
        <div className="admin-header-actions">
          <Link
            href="/admin/notifications"
            className="admin-btn admin-btn-primary"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span>Create Push Broadcast</span>
          </Link>
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap bg-blue-glow">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Known Visitors (DB)</span>
            <span className="admin-stat-number">{totalVisitors}</span>
            <span className="admin-stat-note">Real database records</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap bg-emerald-glow">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Active Push Subscribers</span>
            <span className="admin-stat-number">{activeSubscriptions}</span>
            <span className="admin-stat-note">
              {inactiveSubscriptions} inactive / expired ({totalSubscriptions} total)
            </span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap bg-purple-glow">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Broadcasts</span>
            <span className="admin-stat-number">{totalCampaigns}</span>
            <span className="admin-stat-note">
              {aggregate.totalTargets} total push targets
            </span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap bg-amber-glow">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Delivery Acceptance</span>
            <span className="admin-stat-number">
              {aggregate.totalTargets > 0 ? `${deliveryRate}%` : "100%"}
            </span>
            <span className="admin-stat-note">
              {aggregate.totalSuccess} success / {aggregate.totalFailed} failed
            </span>
          </div>
        </div>
      </div>

      {/* Quick Links & Site Context */}
      <div className="admin-quick-section">
        <div className="admin-panel-card">
          <h2 className="admin-panel-title">System Status & Integration</h2>
          <div className="admin-status-list">
            <div className="admin-status-item">
              <span className="status-indicator is-online" />
              <div className="status-item-text">
                <strong>MongoDB Database</strong>
                <span>Connected (cluster0 - adultLink)</span>
              </div>
              <span className="badge-pill">{totalMovies} Movies Active</span>
            </div>

            <div className="admin-status-item">
              <span className="status-indicator is-online" />
              <div className="status-item-text">
                <strong>Web Push VAPID Protocol</strong>
                <span>Active & configured for standards-compliant browsers</span>
              </div>
              <span className="badge-pill">Web Push v1.1</span>
            </div>

            <div className="admin-status-item">
              <span className="status-indicator is-online" />
              <div className="status-item-text">
                <strong>Count Submission Model</strong>
                <span>
                  Current count: {countDoc ? countDoc.count : 0} | Random index:{" "}
                  {countDoc ? countDoc.random : 1}
                </span>
              </div>
              <Link href="/count" className="admin-text-link">
                Manage Count &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="admin-panel-card">
          <h2 className="admin-panel-title">Push Notification Overview</h2>
          <p className="admin-panel-desc">
            Web Push enables browser-native notifications even when users are not currently browsing the website.
          </p>

          <div className="admin-notification-summary-box">
            <div className="summary-row">
              <span>Permission Granted Users:</span>
              <strong>{grantedPermissions}</strong>
            </div>
            <div className="summary-row">
              <span>Active Push Subscriptions:</span>
              <strong className="text-success">{activeSubscriptions}</strong>
            </div>
            <div className="summary-row">
              <span>Inactive or Expired:</span>
              <strong className="text-muted">{inactiveSubscriptions}</strong>
            </div>
            <div className="summary-row">
              <span>Successful Provider Deliveries:</span>
              <strong>{aggregate.totalSuccess}</strong>
            </div>
          </div>

          <div className="admin-panel-action">
            <Link
              href="/admin/notifications"
              className="admin-btn admin-btn-secondary admin-btn-block"
            >
              Open Web Push Management &amp; Broadcast Form &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Broadcasts */}
      <div className="admin-panel-card mt-6">
        <div className="admin-panel-header">
          <h2 className="admin-panel-title">Recent Broadcast Campaigns</h2>
          <Link href="/admin/notifications" className="admin-text-link">
            View All Campaigns
          </Link>
        </div>

        {recentCampaigns.length === 0 ? (
          <div className="admin-empty-state">
            <p>No broadcast campaigns sent yet.</p>
            <Link
              href="/admin/notifications"
              className="admin-btn admin-btn-sm admin-btn-primary"
            >
              Send Your First Broadcast
            </Link>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Destination URL</th>
                  <th>Status</th>
                  <th>Targets</th>
                  <th>Delivered</th>
                  <th>Failed</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentCampaigns.map((camp) => (
                  <tr key={String(camp._id)}>
                    <td className="font-semibold text-white">{camp.title}</td>
                    <td>
                      <a
                        href={camp.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-table-link"
                      >
                        {camp.destinationUrl}
                      </a>
                    </td>
                    <td>
                      <span className={`status-badge status-${camp.status}`}>
                        {camp.status}
                      </span>
                    </td>
                    <td>{camp.totalTargets}</td>
                    <td className="text-success font-semibold">
                      {camp.successfulPushRequests}
                    </td>
                    <td className="text-danger">
                      {camp.failedPushRequests}
                    </td>
                    <td className="text-muted">
                      {new Date(camp.createdAt).toLocaleDateString()}{" "}
                      {new Date(camp.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
