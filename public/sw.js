// P9X9 Web Push Service Worker

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = {
        title: "P9X9 Update",
        body: event.data.text(),
      };
    }
  }

  const title = data.title || "P9X9 Notification";
  const directUrl = data.data?.url || data.url || "/";

  const options = {
    body: data.body || "New update available on P9X9.",
    icon: data.icon || "/favicon.png",
    badge: data.badge || "/favicon.png",
    image: data.image || undefined,
    data: {
      url: directUrl,
      campaignId: data.data?.campaignId || "",
      timestamp: Date.now(),
    },
    actions: data.actions || [
      {
        action: "open",
        title: data.actionLabel || "Watch Now",
      },
    ],
    vibrate: [200, 100, 200],
    tag: `p9x9-push-${data.data?.campaignId || Date.now()}`,
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const rawUrl = event.notification.data?.url || "/";
  let targetUrl = "/";

  // Validate URL scheme for safety
  try {
    const parsed = new URL(rawUrl, self.location.origin);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      targetUrl = parsed.href;
    }
  } catch {
    targetUrl = self.location.origin;
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Look for an existing open window with the same destination
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        // If an open window with the same origin exists, focus and navigate it
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            return client.focus().then(() => {
              if ("navigate" in client) {
                return client.navigate(targetUrl);
              }
            });
          }
        }
        // Otherwise, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription.options)
      .then((subscription) => {
        return fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            source: "pushsubscriptionchange",
          }),
        });
      })
      .catch((err) => {
        console.error("pushsubscriptionchange error:", err);
      })
  );
});
