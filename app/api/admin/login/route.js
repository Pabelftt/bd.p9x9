import { NextResponse } from "next/server";
import {
  verifyAdminCredentials,
  createAdminSessionToken,
  isRateLimited,
} from "@/lib/admin-auth";
import { SITE_CONFIG } from "@/lib/config";

export async function POST(request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Rate limit: max 5 login attempts per minute per IP
    if (isRateLimited(`login:${ip}`, 5, 60000)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 1 minute." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const username = body?.username;
    const password = body?.password;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const isValid = verifyAdminCredentials(username, password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Create session token
    const token = createAdminSessionToken(username);

    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      user: username,
    });

    response.cookies.set({
      name: SITE_CONFIG.adminCookieName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 3600, // 7 days
    });

    return response;
  } catch (error) {
    console.error("API /api/admin/login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
