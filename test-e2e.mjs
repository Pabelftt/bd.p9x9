const BASE = "http://localhost:3005";

async function runTests() {
  console.log("=== P9X9 SYSTEM VERIFICATION TEST SUITE ===");
  let failed = 0;
  let passed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Homepage
  try {
    const res = await fetch(`${BASE}/`);
    assert(res.status === 200, "1. Homepage returns 200 OK");
  } catch (err) {
    assert(false, `1. Homepage error: ${err.message}`);
  }

  // 2. Existing Movies API
  try {
    const res = await fetch(`${BASE}/api/movies?skip=0`);
    const data = await res.json();
    assert(res.status === 200 && Array.isArray(data.movies), "2. Existing /api/movies returns movies array");
  } catch (err) {
    assert(false, `2. Movies API error: ${err.message}`);
  }

  // 3. Service Worker
  try {
    const res = await fetch(`${BASE}/sw.js`);
    const text = await res.text();
    assert(res.status === 200 && text.includes("addEventListener(\"push\""), "3. Service worker /sw.js is served with push listener");
  } catch (err) {
    assert(false, `3. Service worker error: ${err.message}`);
  }

  // 4. Public VAPID Key
  let vapidPublicKey = "";
  try {
    const res = await fetch(`${BASE}/api/notifications/vapid-key`);
    const data = await res.json();
    vapidPublicKey = data.publicKey;
    assert(res.status === 200 && !!vapidPublicKey, `4. VAPID Key endpoint returns public key (${vapidPublicKey?.slice(0, 15)}...)`);
  } catch (err) {
    assert(false, `4. VAPID key error: ${err.message}`);
  }

  // 5. Push Subscription Registration
  const testEndpoint = `https://fcm.googleapis.com/fcm/send/test-sub-${Date.now()}`;
  try {
    const res = await fetch(`${BASE}/api/notifications/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription: {
          endpoint: testEndpoint,
          keys: {
            p256dh: "BF7a...testP256dhKeyForE2ETestingOnly1234567890=",
            auth: "testAuthKey123==",
          },
        },
        source: "e2e_test",
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, "5. Push subscription created successfully in MongoDB");
  } catch (err) {
    assert(false, `5. Push subscribe error: ${err.message}`);
  }

  // 6. Admin Login with invalid password
  try {
    const res = await fetch(`${BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "wrongpassword" }),
    });
    assert(res.status === 401, "6. Admin login rejected with invalid password (401)");
  } catch (err) {
    assert(false, `6. Admin login rejection error: ${err.message}`);
  }

  // 7. Admin Login with valid credentials
  let adminCookie = "";
  try {
    const res = await fetch(`${BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "p9x9admin2026!" }),
    });
    const setCookie = res.headers.get("set-cookie") || "";
    const match = setCookie.match(/p9x9_admin_session=([^;]+)/);
    if (match) {
      adminCookie = `p9x9_admin_session=${match[1]}`;
    }
    const data = await res.json();
    assert(res.status === 200 && data.success === true && !!adminCookie, "7. Admin login succeeds and returns signed HTTP-only session cookie");
  } catch (err) {
    assert(false, `7. Admin login success error: ${err.message}`);
  }

  // 8. Admin Protected Stats (Unauthorized test)
  try {
    const res = await fetch(`${BASE}/api/admin/stats`);
    assert(res.status === 401, "8. Admin stats protected from unauthenticated access (401)");
  } catch (err) {
    assert(false, `8. Admin stats protection error: ${err.message}`);
  }

  // 9. Admin Protected Stats (Authorized test)
  try {
    const res = await fetch(`${BASE}/api/admin/stats`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    assert(
      res.status === 200 &&
      data.success === true &&
      typeof data.data.visitors.total === "number" &&
      typeof data.data.subscriptions.active === "number",
      `9. Admin stats returns real DB metrics (Visitors: ${data?.data?.visitors?.total}, Active Subs: ${data?.data?.subscriptions?.active})`
    );
  } catch (err) {
    assert(false, `9. Admin stats authorized error: ${err.message}`);
  }

  // 10. Admin Subscriptions List
  try {
    const res = await fetch(`${BASE}/api/admin/subscriptions`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    assert(
      res.status === 200 &&
      Array.isArray(data.subscriptions) &&
      !data.subscriptions.some(s => s.keys), // Verify no private keys exposed
      `10. Admin subscriptions list returns masked items with private keys hidden (Count: ${data?.subscriptions?.length})`
    );
  } catch (err) {
    assert(false, `10. Admin subscriptions list error: ${err.message}`);
  }

  // 11. Broadcast validation (unsafe javascript: URL rejected)
  try {
    const res = await fetch(`${BASE}/api/admin/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        title: "Test",
        destinationUrl: "javascript:alert(1)",
      }),
    });
    assert(res.status === 400, "11. Broadcast rejects unsafe javascript: URL scheme (400)");
  } catch (err) {
    assert(false, `11. Broadcast validation error: ${err.message}`);
  }

  // 12. Broadcast execution
  try {
    const res = await fetch(`${BASE}/api/admin/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        title: "🔥 E2E Test Viral Release",
        message: "This is a verified test broadcast from P9X9 Admin.",
        destinationUrl: "https://bd.p9x9.com/movie/test-video",
        imageUrl: "https://i.postimg.cc/KzKbCSqs/1768441412180.png",
        actionLabel: "Watch Now",
      }),
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.success === true && !!data.campaignId,
      `12. Broadcast campaign executed and recorded in DB (Campaign ID: ${data.campaignId}, Status: ${data.status})`
    );
  } catch (err) {
    assert(false, `12. Broadcast execution error: ${err.message}`);
  }

  // 13. Broadcast Campaigns History
  try {
    const res = await fetch(`${BASE}/api/admin/campaigns`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    assert(
      res.status === 200 &&
      Array.isArray(data.campaigns) &&
      data.campaigns.length > 0,
      `13. Campaign history retrieved with real past broadcasts (Total: ${data?.pagination?.total})`
    );
  } catch (err) {
    assert(false, `13. Campaign history error: ${err.message}`);
  }

  // 14. Admin UI Pages SSR
  try {
    const res = await fetch(`${BASE}/admin`, {
      headers: { Cookie: adminCookie },
    });
    const html = await res.text();
    assert(
      res.status === 200 && html.includes("Dashboard Overview"),
      "14. Admin Dashboard SSR rendered with authenticated session"
    );
  } catch (err) {
    assert(false, `14. Admin dashboard page error: ${err.message}`);
  }

  try {
    const res = await fetch(`${BASE}/admin/notifications`, {
      headers: { Cookie: adminCookie },
    });
    const html = await res.text();
    assert(
      res.status === 200 && html.includes("Web Push Notification Management"),
      "15. Admin Notifications page SSR rendered successfully"
    );
  } catch (err) {
    assert(false, `15. Admin notifications page error: ${err.message}`);
  }

  // 16. Existing /count submission functionality intact
  try {
    const res = await fetch(`${BASE}/api/count`);
    const text = await res.text();
    assert(res.status === 200 && text.includes("random =") && text.includes("count ="), "16. Existing /api/count route functioning normally");
  } catch (err) {
    assert(false, `16. Existing count route error: ${err.message}`);
  }

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
