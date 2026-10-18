import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get("video");
    let name = searchParams.get("name") || "video";

    if (!videoUrl) {
      return new NextResponse("Invalid request: missing video URL", { status: 400 });
    }

    let target;
    try {
      target = new URL(videoUrl.trim());
    } catch {
      return new NextResponse("Invalid request: invalid video URL", { status: 400 });
    }
    if (target.protocol !== "http:" && target.protocol !== "https:") {
      return new NextResponse("Invalid request: unsupported URL scheme", { status: 400 });
    }

    const safeName = name.replace(/[^\w\d]/g, "_").substring(0, 40) || "video";

    const upstream = await fetch(target.href);
    if (!upstream.ok) {
      return new NextResponse("Failed to fetch remote video file", { status: upstream.status });
    }

    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${safeName}.mp4"`);
    headers.set("Content-Type", upstream.headers.get("Content-Type") || "video/mp4");
    if (upstream.headers.has("Content-Length")) {
      headers.set("Content-Length", upstream.headers.get("Content-Length"));
    }

    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Force download error:", error);
    return new NextResponse("Download failed", { status: 500 });
  }
}
