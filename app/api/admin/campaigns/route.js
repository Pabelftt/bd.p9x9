import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { checkAdminAuth } from "@/lib/admin-auth";
import NotificationCampaign from "@/lib/models/NotificationCampaign";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const auth = await checkAdminAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    await connectDB();

    const [campaigns, total] = await Promise.all([
      NotificationCampaign.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NotificationCampaign.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("API /api/admin/campaigns error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
