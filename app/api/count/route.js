import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CountModel from "@/lib/models/Count";

export async function GET() {
  try {
    await connectDB();
    const doc = await CountModel.findOne();
    const random = doc ? doc.random : 1;
    const count = doc ? doc.count : 0;

    return new Response(`random = ${random}\ncount = ${count}`, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("GET /api/count error:", error);
    return new Response("Server error", { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    let countVal;

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      countVal = Number(body.count);
    } else {
      const formData = await request.formData();
      countVal = Number(formData.get("count"));
    }

    if (Number.isNaN(countVal)) {
      return new Response("Invalid count", { status: 400 });
    }

    let doc = await CountModel.findOne();
    if (!doc) {
      doc = new CountModel({ count: countVal, random: 1 });
    } else {
      doc.count = countVal;
      doc.random = (doc.random || 0) + 1;
      if (doc.random > 5) {
        doc.random = 1;
      }
    }

    await doc.save();
    return new Response("Count updated successfully", { status: 200 });
  } catch (error) {
    console.error("POST /api/count error:", error);
    return new Response("Server error", { status: 500 });
  }
}
