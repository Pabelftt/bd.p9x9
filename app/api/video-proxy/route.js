import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/config";
import { getMovieById } from "@/lib/movies";

export async function GET(request) {
  try {
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

    if (!videoUrl) {
      return new NextResponse("Missing video source", { status: 400 });
    }

    const rangeHeader = request.headers.get("range");
    const upstreamHeaders = {};

    if (rangeHeader) {
      upstreamHeaders["Range"] = rangeHeader;
    }

    const upstreamResponse = await fetch(videoUrl, {
      headers: upstreamHeaders,
    });

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
      // Fallback redirect to source if proxy fails
      return NextResponse.redirect(videoUrl, 307);
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
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get("url");
    if (videoUrl) {
      return NextResponse.redirect(videoUrl, 307);
    }
    return new NextResponse("Video stream failed", { status: 500 });
  }
}
