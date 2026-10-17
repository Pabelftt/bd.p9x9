import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PushSubscription from "@/lib/models/PushSubscription";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const endpoint = body?.endpoint;

    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json(
        { error: "Endpoint is required" },
        { status: 400 }
      );
    }

    await connectDB();

    await PushSubscription.updateOne(
      { endpoint },
      {
        status: "inactive",
        permissionState: "denied",
        updatedAt: new Date(),
      }
    );

    return NextResponse.json({
      success: true,
      message: "Push subscription deactivated",
    });
  } catch (error) {
    console.error("API /api/notifications/unsubscribe error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
