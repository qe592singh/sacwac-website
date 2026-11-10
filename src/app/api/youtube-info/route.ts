import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing video id" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${id}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const html = await res.text();
    const match = html.match(/var ytInitialPlayerResponse = (\{[\s\S]*?\});(?:var|<\/script>)/);

    if (match) {
      const data = JSON.parse(match[1]);
      const details = data.videoDetails || {};
      const lengthSeconds = parseInt(details.lengthSeconds || "0", 10);
      const mins = Math.floor(lengthSeconds / 60);
      const secs = lengthSeconds % 60;
      const durationStr = `${mins}:${secs < 10 ? "0" : ""}${secs}`;

      return NextResponse.json({
        success: true,
        title: details.title || "",
        description: details.shortDescription || "",
        duration: durationStr,
        thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      });
    }

    return NextResponse.json({
      success: false,
      error: "Could not retrieve details from YouTube",
    });
  } catch (error) {
    console.error("Error fetching YouTube info:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch YouTube info" },
      { status: 500 }
    );
  }
}
