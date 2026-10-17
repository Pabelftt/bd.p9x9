import webpush from "web-push";
import { SITE_CONFIG } from "./config";

let vapidConfigured = false;

export function configureWebPush() {
  if (vapidConfigured) return true;

  const { vapidPublicKey, vapidPrivateKey, vapidSubject } = SITE_CONFIG;

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn("⚠️ Web Push VAPID keys not configured.");
    return false;
  }

  try {
    webpush.setVapidDetails(vapidSubject || "mailto:admin@p9x9.com", vapidPublicKey, vapidPrivateKey);
    vapidConfigured = true;
    return true;
  } catch (error) {
    console.error("Failed to configure web-push VAPID details:", error);
    return false;
  }
}

export function isValidSafeUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return false;
  const trimmed = urlString.trim();
  // Disallow javascript:, data:, etc.
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function sendWebPush(subscription, payload) {
  const isReady = configureWebPush();
  if (!isReady) {
    throw new Error("Web Push is not properly configured with VAPID keys.");
  }

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  };

  const payloadString = JSON.stringify(payload);
  const options = {
    TTL: 24 * 60 * 60, // 24 hours
    urgency: "high",
  };

  return webpush.sendNotification(pushSubscription, payloadString, options);
}

export default webpush;
