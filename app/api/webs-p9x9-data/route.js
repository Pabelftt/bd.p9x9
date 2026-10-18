import crypto from "crypto";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Movie from "@/lib/models/Movie";

function isValidWebhookSecret(provided, expected) {
  if (typeof provided !== "string" || !provided) return false;
  const bufProvided = Buffer.from(provided);
  const bufExpected = Buffer.from(expected);
  if (bufProvided.length !== bufExpected.length) return false;
  return crypto.timingSafeEqual(bufProvided, bufExpected);
}

export async function POST(request) {
  try {
    // Optional protection: enforced only when SCRAPER_WEBHOOK_SECRET is set,
    // so existing scrapers keep working until the secret is configured.
    const webhookSecret = (process.env.SCRAPER_WEBHOOK_SECRET || "").trim();
    if (webhookSecret) {
      const provided = request.headers.get("x-webhook-secret") || "";
      if (!isValidWebhookSecret(provided, webhookSecret)) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }
    }

    await connectDB();
    const body = await request.json().catch(() => ({}));

    const title = String(body.title || "").trim();
    if (!title) {
      return NextResponse.json(
        { success: false, message: "title is required" },
        { status: 400 }
      );
    }

    let routeName = String(body.routeName || "").toLowerCase().trim();
    if (!routeName) {
      routeName = title
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    }

    const hadding = title;
    const img = String(body.imageLink || body.img || "").trim();
    const play = String(body.videoLink || body.video || body.play || "").trim();

    const existing = await Movie.findOne({ id: routeName });
    if (existing) {
      existing.hadding = hadding;
      existing.img = img;
      existing.play = play;
      await existing.save();
    } else {
      await Movie.create({ id: routeName, hadding, img, play });
    }

    return NextResponse.json({
      success: true,
      apiSuccess: true,
      message: "Data saved successfully",
      routeName,
    });
  } catch (error) {
    console.error("API webs-p9x9-data error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
