"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import {
  isPushSupported,
  subscribeUserToPush,
  unsubscribeUserFromPush,
  getExistingSubscription,
} from "@/lib/push-client";

const DISMISS_KEY = "p9x9_push_dismissed_until";
const DISMISS_DAYS = 7;
const emptySubscribe = () => () => {};

function getNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "default";
  }
  return Notification.permission;
}

export default function NotificationPrompt() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const browserPermission = useSyncExternalStore(
    emptySubscribe,
    getNotificationPermission,
    () => "default"
  );

  const [overridePermission, setOverridePermission] = useState(null);
  const permission = overridePermission || browserPermission;

  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    try {
      if (!isPushSupported()) {
        return;
      }

      // Check existing subscription
      getExistingSubscription()
        .then((sub) => {
          if (sub) {
            setIsSubscribed(true);
          }
        })
        .catch(() => {});

      // Check if dismissed previously
      const dismissedUntil = localStorage.getItem(DISMISS_KEY);
      const isDismissed = dismissedUntil && Number(dismissedUntil) > Date.now();

      const currentPerm = getNotificationPermission();
      // If permission is default and not dismissed, show prompt after 2.5 seconds
      if (currentPerm === "default" && !isDismissed) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 2500);
        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.warn("Notification prompt init error:", err);
    }
  }, []);

  const handleAllow = async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      await subscribeUserToPush("floating_prompt");
      setIsSubscribed(true);
      setOverridePermission("granted");
      setShowPrompt(false);
      setShowManageModal(false);
    } catch (err) {
      console.warn("Subscription failed:", err);
      if (Notification.permission === "denied") {
        setOverridePermission("denied");
        setStatusMessage("Notifications blocked in browser settings.");
      } else {
        setStatusMessage("Could not enable notifications. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    const cooloffMs = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, String(cooloffMs));
  };

  const handleToggleSubscription = async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      if (isSubscribed) {
        await unsubscribeUserFromPush();
        setIsSubscribed(false);
        setStatusMessage("You have been unsubscribed from notifications.");
      } else {
        await subscribeUserToPush("settings_toggle");
        setIsSubscribed(true);
        setOverridePermission("granted");
        setStatusMessage("Notifications successfully enabled!");
      }
    } catch (err) {
      console.error("Toggle subscription error:", err);
      setStatusMessage("Action could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient || !isPushSupported()) {
    return null;
  }

  return (
    <>
      {/* 1. First-time Non-intrusive Floating Invitation Banner */}
      {showPrompt && permission === "default" && (
        <aside
          className="push-prompt-banner"
          role="region"
          aria-label="Notification Invitation"
        >
          <div className="push-prompt-content">
            <div className="push-prompt-icon-wrap" aria-hidden="true">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="push-bell-svg"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </div>
            <div className="push-prompt-text">
              <span className="push-prompt-title">Get Instant Video Updates</span>
              <p className="push-prompt-desc">
                Receive instant alerts when new viral links and trending videos are posted. No spam, disable anytime.
              </p>
            </div>
          </div>

          <div className="push-prompt-actions">
            <button
              type="button"
              onClick={handleAllow}
              disabled={loading}
              className="push-btn-allow"
            >
              {loading ? "Enabling..." : "Allow Notifications"}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              disabled={loading}
              className="push-btn-dismiss"
            >
              Not Now
            </button>
          </div>
          {statusMessage && <p className="push-status-note">{statusMessage}</p>}
        </aside>
      )}

      {/* 2. Discrete Floating Notification Bell (for voluntary user control) */}
      <div className="push-fab-wrap">
        <button
          type="button"
          onClick={() => setShowManageModal((prev) => !prev)}
          className={`push-fab-btn ${isSubscribed ? "is-active" : ""}`}
          title={isSubscribed ? "Notification Settings (Active)" : "Notification Settings"}
          aria-label="Notification Settings"
        >
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
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {isSubscribed && <span className="push-fab-badge" />}
        </button>

        {/* Voluntary Preference Modal / Popover */}
        {showManageModal && (
          <div className="push-manage-modal">
            <div className="push-manage-header">
              <span className="push-manage-title">Push Notifications</span>
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="push-manage-close"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="push-manage-body">
              <p className="push-manage-desc">
                Status:{" "}
                <strong className={isSubscribed ? "text-success" : "text-muted"}>
                  {isSubscribed ? "Active (Subscribed)" : "Not Subscribed"}
                </strong>
              </p>
              <p className="push-manage-subtext">
                {isSubscribed
                  ? "You will receive updates when top viral videos are published."
                  : "Subscribe to stay up-to-date with new content releases."}
              </p>

              {permission === "denied" && (
                <p className="push-warning-text">
                  Notifications are blocked in your browser settings. To receive updates, please allow notifications in your browser address bar.
                </p>
              )}

              {statusMessage && <p className="push-status-note">{statusMessage}</p>}

              <div className="push-manage-actions">
                <button
                  type="button"
                  onClick={handleToggleSubscription}
                  disabled={loading || permission === "denied"}
                  className={`push-manage-toggle-btn ${
                    isSubscribed ? "btn-danger" : "btn-primary"
                  }`}
                >
                  {loading
                    ? "Updating..."
                    : isSubscribed
                    ? "Unsubscribe"
                    : "Subscribe Now"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
