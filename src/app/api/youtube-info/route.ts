import { NextResponse } from "next/server";
import { extractYoutubeId, getYoutubeThumbnail } from "@/lib/youtube";

function formatDuration(lengthSeconds: number): string {
  if (isNaN(lengthSeconds) || lengthSeconds <= 0) return "15:00";
  const hours = Math.floor(lengthSeconds / 3600);
  const mins = Math.floor((lengthSeconds % 3600) / 60);
  const secs = lengthSeconds % 60;
  if (hours > 0) {
    return `${hours}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function detectCategory(title: string, desc: string, tags: string[] = []): string {
  const combined = `${title} ${desc} ${tags.join(" ")}`.toLowerCase();
  if (/flow|screen flow|record-triggered|schedule-triggered|autolaunched/.test(combined)) return "Flows";
  if (/security|permission set|profile|sharing rule|owd|mfa|authenticator/.test(combined)) return "Security";
  if (/apex|trigger|test class|soql|sosl|batch apex|future/.test(combined)) return "Apex";
  if (/validation rule/.test(combined)) return "Validation Rules";
  if (/scenario|interview/.test(combined)) return "Scenarios";
  if (/integration|rest api|named credential|client credential/.test(combined)) return "Integration";
  if (/admin|object|field|page layout|app builder/.test(combined)) return "Admin";
  return "Flows";
}

function extractEpisodeNumber(text: string): string {
  const match = text.match(/(?:Episode|Ep\.?|Lesson|Part|#)\s*(\d+)/i);
  return match ? match[1] : "";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawId = searchParams.get("id") || searchParams.get("url") || "";

  if (!rawId) {
    return NextResponse.json({ success: false, error: "Missing video id or url" }, { status: 400 });
  }

  const id = extractYoutubeId(rawId) || rawId.trim();

  // Strategy 1: YouTube Innertube official client API
  try {
    const res = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        videoId: id,
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20230522.01.00",
          },
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const details = data.videoDetails;

      if (details && details.title) {
        const lengthSeconds = parseInt(details.lengthSeconds || "0", 10);
        const durationStr = formatDuration(lengthSeconds);
        const viewCount = parseInt(details.viewCount || "0", 10);
        const ep = extractEpisodeNumber(details.title);
        const tags = Array.isArray(details.keywords) ? details.keywords : [];
        const category = detectCategory(details.title, details.shortDescription || "", tags);

        return NextResponse.json({
          success: true,
          id,
          title: details.title,
          description: details.shortDescription || "",
          duration: durationStr,
          views: viewCount,
          viewsText: `${viewCount.toLocaleString()} views`,
          thumbnailUrl: getYoutubeThumbnail(id),
          episode: ep,
          suggestedCategory: category,
          tags,
        });
      }
    }
  } catch (err) {
    console.error("Innertube fetch error:", err);
  }

  // Strategy 2: YouTube Watch Page HTML
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${id}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const html = await res.text();
    const match = html.match(/var ytInitialPlayerResponse\s*=\s*(\{[\s\S]*?\});(?:var|<\/script>)/);

    if (match) {
      const data = JSON.parse(match[1]);
      const details = data.videoDetails || {};
      const lengthSeconds = parseInt(details.lengthSeconds || "0", 10);
      const durationStr = formatDuration(lengthSeconds);
      const viewCount = parseInt(details.viewCount || "0", 10);
      const ep = extractEpisodeNumber(details.title || "");
      const tags = Array.isArray(details.keywords) ? details.keywords : [];
      const category = detectCategory(details.title || "", details.shortDescription || "", tags);

      return NextResponse.json({
        success: true,
        id,
        title: details.title || "",
        description: details.shortDescription || "",
        duration: durationStr,
        views: viewCount,
        viewsText: `${viewCount.toLocaleString()} views`,
        thumbnailUrl: getYoutubeThumbnail(id),
        episode: ep,
        suggestedCategory: category,
        tags,
      });
    }
  } catch (err) {
    console.error("HTML watch page fetch error:", err);
  }

  // Strategy 3: YouTube oEmbed
  try {
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
    );

    if (oembedRes.ok) {
      const odata = await oembedRes.json();
      const ep = extractEpisodeNumber(odata.title || "");
      const category = detectCategory(odata.title || "", "");

      return NextResponse.json({
        success: true,
        id,
        title: odata.title || "",
        description: "",
        duration: "15:00",
        views: 0,
        viewsText: "0 views",
        thumbnailUrl: odata.thumbnail_url || getYoutubeThumbnail(id),
        episode: ep,
        suggestedCategory: category,
        tags: [],
      });
    }
  } catch (err) {
    console.error("oEmbed fetch error:", err);
  }

  return NextResponse.json(
    {
      success: false,
      error: "Could not retrieve details from YouTube",
    },
    { status: 404 }
  );
}
