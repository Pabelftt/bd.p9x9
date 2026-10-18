import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/config";
import { getMovieById } from "@/lib/movies";

const UPSTREAM_TIMEOUT_MS = 15000;

function parseHttpUrl(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    const parsed = new URL(raw.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed;
  } catch {
    return null;
  }
}

function browserFallbackUrl(target) {
  // The site is served over HTTPS, so redirecting a media element to an http://
  // URL would be blocked by the browser as mixed content. Upgrade to https.
  if (target.protocol === "http:") {
    const upgraded = new URL(target.href);
    upgraded.protocol = "https:";
    return upgraded.href;
  }
  return target.href;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let videoUrl = searchParams.get("url");
  const id = searchParams.get("id");

  // If ID is provided, look up upstream URL securely from database
  if (id && !videoUrl) {
    try {
      const movie = await getMovieById(id);
      if (movie && movie.play) {
        videoUrl = movie.play;
      }
    } catch (err) {
      console.error("Failed to resolve movie video URL by id:", err);
    }
  }

  const target = parseHttpUrl(videoUrl);
  if (!target) {
    return new NextResponse("Missing or invalid video source", { status: 400 });
  }

  const fallbackUrl = browserFallbackUrl(target);

  try {
    const rangeHeader = request.headers.get("range");
    const upstreamHeaders = {};

    if (rangeHeader) {
      upstreamHeaders["Range"] = rangeHeader;
    }

    const upstreamResponse = await fetch(target.href, {
      headers: upstreamHeaders,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      redirect: "follow",
    });

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
      // Upstream refused this server (blocked datacenter IP, hotlink
      // protection, etc). Fall back to the existing redirect design so the
      // visitor's own browser can load the source directly.
      return NextResponse.redirect(fallbackUrl, 307);
    }

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", upstreamResponse.headers.get("Content-Type") || "video/mp4");
    responseHeaders.set("Accept-Ranges", "bytes");

    // 10-minute cache guarantee as required
    responseHeaders.set(
      "Cache-Control",
      `public, max-age=${SITE_CONFIG.videoCacheMaxAgeSeconds}, stale-while-revalidate=300`
    );

    if (upstreamResponse.headers.has("Content-Range")) {
      responseHeaders.set("Content-Range", upstreamResponse.headers.get("Content-Range"));
    }
    if (upstreamResponse.headers.has("Content-Length")) {
      responseHeaders.set("Content-Length", upstreamResponse.headers.get("Content-Length"));
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status, // 206 or 200
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Video proxy stream error:", error);
    // Never fail the playback path with a 500 when the source URL is known:
    // redirect the browser to the source so it can still stream directly.
    return NextResponse.redirect(fallbackUrl, 307);
  }
}
