import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import NotificationCampaign from "@/lib/models/NotificationCampaign";
import { formatEnglishTitle } from "@/lib/movies";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, Math.min(20, parseInt(searchParams.get("limit") || "10", 10)));
    const since = searchParams.get("since");

    const query = { status: { $in: ["completed", "processing", "partial"] } };
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        query.createdAt = { $gt: sinceDate };
      }
    }

    const campaigns = await NotificationCampaign.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("title message imageUrl destinationUrl actionLabel createdAt")
      .lean();

    const sanitized = campaigns.map((c) => ({
      id: String(c._id),
      title: formatEnglishTitle(c.title, ""),
      message: c.message || "",
      imageUrl: c.imageUrl || "",
      destinationUrl: c.destinationUrl || "",
      actionLabel: c.actionLabel || "Watch Now",
      createdAt: c.createdAt,
    }));

    const response = NextResponse.json({
      success: true,
      campaigns: sanitized,
      count: sanitized.length,
      latestTimestamp: sanitized.length > 0 ? sanitized[0].createdAt : null,
    });

    response.headers.set("Cache-Control", "public, s-maxage=10, stale-while-revalidate=30");
    return response;
  } catch (error) {
    console.error("API /api/notifications/broadcast error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
