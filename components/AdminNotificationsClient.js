"use client";

import { useState } from "react";

export default function AdminNotificationsClient({
  initialStats,
  initialCampaigns,
  initialSubscriptions,
}) {
  const [stats, setStats] = useState(initialStats);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [subscriptions] = useState(initialSubscriptions);

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("https://bd.p9x9.com/");
  const [imageUrl, setImageUrl] = useState("");
  const [actionLabel, setActionLabel] = useState("Watch Now");

  // UI state
  const [imageError, setImageError] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);
  const [formError, setFormError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Quick Preset Samples
  const handleLoadSample = (type = "trending") => {
    setImageError(false);
    if (type === "trending") {
      setTitle("🔥 New Trending Video Just Dropped!");
      setMessage("Watch the latest viral release in high definition. Tap to stream instantly.");
      setDestinationUrl("https://bd.p9x9.com/");
      setImageUrl("https://i.postimg.cc/KzKbCSqs/1768441412180.png");
      setActionLabel("Watch Now");
    } else {
      setTitle("🎬 Daily Exclusive Release Available");
      setMessage("Check out today's top rated video. Free high-speed streaming.");
      setDestinationUrl("https://bd.p9x9.com/");
      setImageUrl("");
      setActionLabel("Stream Now");
    }
  };

  const handleClear = () => {
    setTitle("");
    setMessage("");
    setDestinationUrl("https://bd.p9x9.com/");
    setImageUrl("");
    setActionLabel("Watch Now");
    setImageError(false);
    setFormError("");
    setBroadcastResult(null);
  };

  const validateForm = () => {
    if (!title.trim()) {
      setFormError("Notification Title is required.");
      return false;
    }

    if (!destinationUrl.trim()) {
      setFormError("Direct Link URL is required.");
      return false;
    }

    try {
      const parsed = new URL(destinationUrl.trim());
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        setFormError("Destination URL must use http:// or https:// protocol.");
        return false;
      }
    } catch {
      setFormError("Destination URL is not a valid URL.");
      return false;
    }

    if (imageUrl.trim()) {
      try {
        const parsedImg = new URL(imageUrl.trim());
        if (parsedImg.protocol !== "http:" && parsedImg.protocol !== "https:") {
          setFormError("Image URL must use http:// or https:// protocol.");
          return false;
        }
      } catch {
        setFormError("Image URL is not a valid URL.");
        return false;
      }
    }

    setFormError("");
    return true;
  };

  const handlePreBroadcast = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowConfirmModal(true);
  };

  const handleExecuteBroadcast = async () => {
    setShowConfirmModal(false);
    setIsBroadcasting(true);
    setBroadcastResult(null);
    setFormError("");

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          destinationUrl: destinationUrl.trim(),
          imageUrl: imageUrl.trim(),
          actionLabel: actionLabel.trim() || "Watch Now",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setBroadcastResult({
          type: "danger",
          title: "Broadcast Failed",
          message: data.error || "An error occurred during push broadcast.",
        });
      } else {
        setBroadcastResult({
          type: data.failedPushRequests > 0 ? "warning" : "success",
          title: "Broadcast Completed",
          message: data.message,
          stats: {
            totalTargets: data.totalTargets,
            success: data.successfulPushRequests,
            failed: data.failedPushRequests,
            status: data.status,
          },
        });
        // Refresh campaign history and stats
        await refreshData();
      }
    } catch (err) {
      setBroadcastResult({
        type: "danger",
        title: "Network Error",
        message: err.message || "Failed to communicate with broadcast server.",
      });
    } finally {
      setIsBroadcasting(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const [statsRes, campRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/campaigns?limit=15"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.data) setStats(statsData.data);
      }

      if (campRes.ok) {
        const campData = await campRes.json();
        if (campData.campaigns) setCampaigns(campData.campaigns);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const activeSubscribersCount = stats?.subscriptions?.active ?? 0;
  const totalSubscribersCount = stats?.subscriptions?.total ?? 0;
  const inactiveSubscribersCount = stats?.subscriptions?.inactive ?? 0;
  const totalCampaignsCount = stats?.broadcasts?.total ?? 0;
  const totalDeliveries = stats?.broadcasts?.successfulDeliveries ?? 0;
  const failedDeliveries = stats?.broadcasts?.failedDeliveries ?? 0;

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Web Push Notification Management</h1>
          <p className="admin-page-desc">
            Broadcast instant push notifications to active subscribers and manage campaign performance.
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            onClick={refreshData}
            disabled={refreshing}
            className="admin-btn admin-btn-secondary"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={refreshing ? "animate-spin" : ""}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>{refreshing ? "Refreshing..." : "Refresh Stats"}</span>
          </button>
        </div>
      </div>

      {/* Section A: Subscription Statistics Cards */}
      <div className="admin-stats-grid">
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
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Active Subscriptions</span>
            <span className="admin-stat-number">{activeSubscribersCount}</span>
            <span className="admin-stat-note">Subscribers eligible for push</span>
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
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Inactive / Expired</span>
            <span className="admin-stat-number">{inactiveSubscribersCount}</span>
            <span className="admin-stat-note">Out of {totalSubscribersCount} total recorded</span>
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
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Broadcast Campaigns</span>
            <span className="admin-stat-number">{totalCampaignsCount}</span>
            <span className="admin-stat-note">All-time campaigns created</span>
          </div>
        </div>

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
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Successful Deliveries</span>
            <span className="admin-stat-number">{totalDeliveries}</span>
            <span className="admin-stat-note">{failedDeliveries} failed attempts</span>
          </div>
        </div>
      </div>

      {/* Broadcast Result Banner */}
      {broadcastResult && (
        <div className={`admin-alert admin-alert-${broadcastResult.type} mt-4`}>
          <div className="admin-alert-title">
            <strong>{broadcastResult.title}</strong>
          </div>
          <p>{broadcastResult.message}</p>
          {broadcastResult.stats && (
            <div className="admin-alert-stats">
              <span>Target Devices: {broadcastResult.stats.totalTargets}</span>
              <span>Accepted: {broadcastResult.stats.success}</span>
              <span>Failed: {broadcastResult.stats.failed}</span>
              <span>Status: {broadcastResult.stats.status}</span>
            </div>
          )}
        </div>
      )}

      {/* Section B & C: Broadcast Form + Live Notification Preview */}
      <div className="admin-broadcast-grid mt-6">
        {/* Left Column: Form */}
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <h2 className="admin-panel-title">Compose Web Push Broadcast</h2>
              <p className="admin-panel-desc">
                Fill out the notification details. The live preview updates in real time.
              </p>
            </div>
            <div className="admin-preset-btns">
              <button
                type="button"
                onClick={() => handleLoadSample("trending")}
                className="admin-btn-tag"
                title="Fill sample trending release"
              >
                + Sample Trending
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="admin-btn-tag admin-btn-tag-danger"
                title="Clear all fields"
              >
                Clear
              </button>
            </div>
          </div>

          {formError && (
            <div className="admin-alert admin-alert-danger mb-4">
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handlePreBroadcast} className="admin-broadcast-form">
            <div className="admin-field">
              <label htmlFor="notifTitle">
                Notification Title <span className="text-danger">*</span>
              </label>
              <input
                id="notifTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 🔥 Exclusive Viral Video Release"
                maxLength={100}
                required
                className="admin-input"
              />
              <span className="admin-char-count">{title.length} / 100</span>
            </div>

            <div className="admin-field">
              <label htmlFor="notifMessage">Notification Message</label>
              <textarea
                id="notifMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g., Watch the latest high-definition Bangladeshi video. Instant playback now available."
                rows={3}
                maxLength={250}
                className="admin-textarea"
              />
              <span className="admin-char-count">{message.length} / 250</span>
            </div>

            <div className="admin-field">
              <label htmlFor="notifDestUrl">
                Direct Link URL <span className="text-danger">*</span>
              </label>
              <input
                id="notifDestUrl"
                type="url"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                placeholder="https://bd.p9x9.com/movie/your-video-id"
                required
                className="admin-input"
              />
              <span className="admin-input-hint">
                Users will be directed to this exact URL when they click the notification.
              </span>
            </div>

            <div className="admin-field">
              <label htmlFor="notifImageUrl">
                Image URL <span className="text-muted">(Optional large thumbnail)</span>
              </label>
              <input
                id="notifImageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImageError(false);
                }}
                placeholder="https://i.postimg.cc/your-image.png"
                className="admin-input"
              />
              <span className="admin-input-hint">
                Supported on Android &amp; Chrome desktop. If omitted, only site icon is shown.
              </span>
            </div>

            <div className="admin-field">
              <label htmlFor="notifActionLabel">
                Action Button Label <span className="text-muted">(Optional)</span>
              </label>
              <input
                id="notifActionLabel"
                type="text"
                value={actionLabel}
                onChange={(e) => setActionLabel(e.target.value)}
                placeholder="Watch Now"
                maxLength={30}
                className="admin-input"
              />
            </div>

            <div className="admin-form-actions">
              <button
                type="submit"
                disabled={isBroadcasting}
                className="admin-btn admin-btn-primary admin-btn-lg"
              >
                {isBroadcasting ? (
                  <>
                    <span className="animate-spin mr-2">&#9696;</span>
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    <span>
                      Broadcast to {activeSubscribersCount} Active Subscribers
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Notification Preview */}
        <div className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <h2 className="admin-panel-title">Live Notification Preview</h2>
              <p className="admin-panel-desc">
                Simulated appearance across compatible desktop and mobile devices.
              </p>
            </div>
          </div>

          <div className="admin-preview-container">
            <div className="preview-os-frame">
              {/* Native notification simulated card */}
              <div className="preview-notif-card">
                {/* Header: App Name & Icon */}
                <div className="preview-notif-header">
                  <div className="preview-icon-badge">
                    <img
                      src="/favicon.png"
                      alt="P9X9 Icon"
                      width={18}
                      height={18}
                      className="preview-app-icon"
                    />
                  </div>
                  <span className="preview-app-name">P9X9</span>
                  <span className="preview-dot">•</span>
                  <span className="preview-timestamp">Just now</span>
                </div>

                {/* Body Content */}
                <div className="preview-notif-body">
                  <div className="preview-text-col">
                    <h4 className="preview-notif-title">
                      {title.trim() || "Notification Title Goes Here"}
                    </h4>
                    <p className="preview-notif-message">
                      {message.trim() ||
                        "Notification body text preview will appear here as you type."}
                    </p>
                    <span className="preview-notif-domain">
                      {destinationUrl.trim()
                        ? new URL(
                            destinationUrl.startsWith("http")
                              ? destinationUrl
                              : "https://bd.p9x9.com"
                          ).hostname
                        : "bd.p9x9.com"}
                    </span>
                  </div>

                  {/* Small right thumbnail if image provided */}
                  {imageUrl.trim() && !imageError && (
                    <div className="preview-thumbnail-col">
                      <img
                        src={imageUrl.trim()}
                        alt="Thumbnail"
                        onError={() => setImageError(true)}
                        className="preview-thumb-img"
                      />
                    </div>
                  )}
                </div>

                {/* Large expandable image preview */}
                {imageUrl.trim() && !imageError && (
                  <div className="preview-large-image-wrap">
                    <img
                      src={imageUrl.trim()}
                      alt="Notification Hero"
                      onError={() => setImageError(true)}
                      className="preview-large-img"
                    />
                  </div>
                )}

                {/* Action buttons simulated */}
                <div className="preview-actions-row">
                  <button type="button" className="preview-action-btn">
                    {actionLabel.trim() || "Watch Now"}
                  </button>
                  <button type="button" className="preview-action-btn preview-action-btn-secondary">
                    Dismiss
                  </button>
                </div>
              </div>

              <div className="preview-disclaimer">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>
                  Admin preview is an approximation. Native appearance varies by OS (Windows, Android, macOS, Linux) and browser engine.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Confirm Push Broadcast</h3>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="admin-modal-close"
              >
                &times;
              </button>
            </div>

            <div className="admin-modal-body">
              <p className="admin-modal-lead">
                You are about to broadcast this push notification to:
              </p>
              <div className="admin-modal-highlight">
                <strong>{activeSubscribersCount} Active Subscribed Devices</strong>
              </div>

              <div className="admin-confirm-summary">
                <div className="confirm-item">
                  <span className="confirm-label">Title:</span>
                  <span className="confirm-value font-semibold">{title}</span>
                </div>
                {message && (
                  <div className="confirm-item">
                    <span className="confirm-label">Message:</span>
                    <span className="confirm-value">{message}</span>
                  </div>
                )}
                <div className="confirm-item">
                  <span className="confirm-label">Direct Link:</span>
                  <span className="confirm-value text-blue">{destinationUrl}</span>
                </div>
                {imageUrl && (
                  <div className="confirm-item">
                    <span className="confirm-label">Image:</span>
                    <span className="confirm-value text-muted truncate">{imageUrl}</span>
                  </div>
                )}
              </div>

              <p className="admin-modal-warning">
                This action sends real push messages to all subscribed user browsers. Please confirm you want to proceed.
              </p>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBroadcast}
                className="admin-btn admin-btn-primary"
              >
                Yes, Send Broadcast Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section D: Broadcast History */}
      <div className="admin-panel-card mt-8">
        <div className="admin-panel-header">
          <div>
            <h2 className="admin-panel-title">Broadcast History &amp; Analytics</h2>
            <p className="admin-panel-desc">
              All previous notification broadcasts, delivery metrics, and status reports.
            </p>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="admin-empty-state">
            <p>No broadcast campaigns found in the database.</p>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title &amp; Message</th>
                  <th>Image</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Targets</th>
                  <th>Accepted</th>
                  <th>Failed</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((camp) => (
                  <tr key={String(camp._id)}>
                    <td className="max-w-xs">
                      <div className="table-title font-semibold text-white">
                        {camp.title}
                      </div>
                      {camp.message && (
                        <div className="table-desc text-muted truncate">
                          {camp.message}
                        </div>
                      )}
                    </td>
                    <td>
                      {camp.imageUrl ? (
                        <img
                          src={camp.imageUrl}
                          alt="Campaign Thumbnail"
                          width={48}
                          height={32}
                          className="table-thumb"
                        />
                      ) : (
                        <span className="text-muted text-xs">No image</span>
                      )}
                    </td>
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
                    <td className="font-semibold">{camp.totalTargets}</td>
                    <td className="text-success font-semibold">
                      {camp.successfulPushRequests}
                    </td>
                    <td className="text-danger">
                      {camp.failedPushRequests}
                    </td>
                    <td className="text-muted whitespace-nowrap">
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
