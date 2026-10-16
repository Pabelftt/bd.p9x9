import { NextResponse } from "next/server";
import { getMovieById } from "@/lib/movies";
import { SITE_CONFIG } from "@/lib/config";

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const videoId = resolvedParams?.id;

    if (!videoId) {
      return NextResponse.json({ error: "Missing video id" }, { status: 400 });
    }

    const movie = await getMovieById(videoId);
    if (!movie) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const targetUrl = SITE_CONFIG.videoRedirectUrl;
    if (!targetUrl) {
      return NextResponse.json({ redirectUrl: null });
    }

    let redirectUrl;
    try {
      redirectUrl = new URL(targetUrl);
      if (redirectUrl.protocol !== "https:" && redirectUrl.protocol !== "http:") {
        return NextResponse.json(
          { error: "Smart link must use HTTP or HTTPS" },
          { status: 500 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid video redirect URL configured" },
        { status: 500 }
      );
    }

    const pagePath = `/movie/${encodeURIComponent(videoId)}`;
    const cookiePayload = JSON.stringify({ videoId, pagePath });

    const response = NextResponse.json({ redirectUrl: redirectUrl.href });

    response.cookies.set({
      name: SITE_CONFIG.cookieName,
      value: encodeURIComponent(cookiePayload),
      maxAge: SITE_CONFIG.cookieMaxAgeSeconds, // 5 minutes (300s)
      path: "/",
      httpOnly: false, // Accessible to client-side player checks and server-side SSR
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("API smart-link error:", error);
    return NextResponse.json({ error: "Unable to process smart link" }, { status: 500 });
  }
}
