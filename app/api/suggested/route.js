import { NextResponse } from "next/server";
import { getSuggestedMovies } from "@/lib/movies";
import { SITE_CONFIG } from "@/lib/config";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeId = searchParams.get("excludeId") || "";
    const skip = parseInt(searchParams.get("skip") || "0", 10);

    if (Number.isNaN(skip) || skip < 0) {
      return NextResponse.json({ error: "skip must be a non-negative integer" }, { status: 400 });
    }

    const { movies, hasMore } = await getSuggestedMovies(excludeId, skip, SITE_CONFIG.moviePageSize);

    const response = NextResponse.json({
      movies,
      hasMore,
    });

    response.headers.set("Cache-Control", `private, max-age=${SITE_CONFIG.videoCacheMaxAgeSeconds}`);
    return response;
  } catch (error) {
    console.error("API /api/suggested error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
