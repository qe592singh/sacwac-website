import { NextResponse } from "next/server";
import { syncYouTubeChannel } from "@/lib/youtube-sync";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  try {
    const result = await syncYouTubeChannel({ maxResults: 30 });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Sync failed";
    console.error("YouTube sync error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await syncYouTubeChannel({ maxResults: 30 });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Sync failed";
    console.error("YouTube sync error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
