import crypto from "crypto";
import { cookies } from "next/headers";
import { SITE_CONFIG } from "./config";

function safeCompare(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function signPayload(payloadStr, secret) {
  return crypto.createHmac("sha256", secret).update(payloadStr).digest("base64url");
}

export function createAdminSessionToken(username = "admin", maxAgeSeconds = 7 * 24 * 3600) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + maxAgeSeconds;
  const payload = JSON.stringify({ username, iat, exp });
  const payloadB64 = Buffer.from(payload).toString("base64url");
  const signature = signPayload(payloadB64, SITE_CONFIG.adminSessionSecret);
  return `${payloadB64}.${signature}`;
}

export function verifyAdminSessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSig = signPayload(payloadB64, SITE_CONFIG.adminSessionSecret);

  if (!safeCompare(signature, expectedSig)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload = JSON.parse(jsonStr);
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function verifyAdminCredentials(username, password) {
  if (!username || !password) return false;
  const expectedUser = SITE_CONFIG.adminUsername || "admin";
  const expectedPass = SITE_CONFIG.adminPassword || "p9x9admin2026!";

  const userMatch = safeCompare(String(username).trim(), expectedUser);
  const passMatch = safeCompare(String(password).trim(), expectedPass);

  return userMatch && passMatch;
}

export async function checkAdminAuth(request) {
  let token = null;

  // 1. Try reading from request if provided (Route Handler)
  if (request) {
    if (typeof request.cookies?.get === "function") {
      token = request.cookies.get(SITE_CONFIG.adminCookieName)?.value;
    } else if (request.headers) {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${SITE_CONFIG.adminCookieName}=`));
      if (match) {
        token = match.substring(`${SITE_CONFIG.adminCookieName}=`.length);
      }
    }
  }

  // 2. If not found and in server component context, try next/headers cookies()
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SITE_CONFIG.adminCookieName)?.value;
    } catch {}
  }

  if (!token) return { authenticated: false };

  const session = verifyAdminSessionToken(token);
  if (!session) return { authenticated: false };

  return { authenticated: true, user: session.username };
}

// In-memory sliding window rate limiter
const rateLimits = new Map();

export function isRateLimited(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimits.get(key) || [];
  const validTimestamps = entry.filter((time) => now - time < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return true;
  }

  validTimestamps.push(now);
  rateLimits.set(key, validTimestamps);

  // Periodic cleanup
  if (rateLimits.size > 1000) {
    for (const [k, timestamps] of rateLimits.entries()) {
      if (timestamps.every((t) => now - t > windowMs)) {
        rateLimits.delete(k);
      }
    }
  }

  return false;
}
