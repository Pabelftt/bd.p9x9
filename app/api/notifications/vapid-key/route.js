import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/config";

export async function GET() {
  const publicKey = SITE_CONFIG.vapidPublicKey;

  if (!publicKey) {
    return NextResponse.json(
      { error: "VAPID public key not configured on server" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { publicKey },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
