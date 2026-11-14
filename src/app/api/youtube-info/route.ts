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

const YOUTUBE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Cookie: "SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg; CONSENT=YES+cb.20210328-17-p0.en+FX+478",
};

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawId = searchParams.get("id") || searchParams.get("url") || "";

  if (!rawId) {
    return NextResponse.json({ success: false, error: "Missing video id or url" }, { status: 400 });
  }

  // Extract pure 11-char ID
  let id = extractYoutubeId(rawId);
  if (!id) {
    const cleaned = rawId.trim();
    if (cleaned.length === 11) {
      id = cleaned;
    } else {
      const match = cleaned.match(/([a-zA-Z0-9_-]{11})/);
      id = match ? match[1] : cleaned;
    }
  }

  // Strategy 1: YouTube Watch Page with consent bypass (Fast & reliable on Vercel AWS IPs)
  try {
    const watchRes = await fetch(`https://www.youtube.com/watch?v=${id}`, {
      headers: YOUTUBE_HEADERS,
      signal: AbortSignal.timeout(6000),
    });

    if (watchRes.ok) {
      const html = await watchRes.text();
      let details: {
        title?: string;
        lengthSeconds?: string;
        viewCount?: string;
        shortDescription?: string;
        keywords?: string[];
      } | null = null;

      const m = html.match(
        /(?:var\s+|window\[['"]ytInitialPlayerResponse['"]\]\s*=\s*|ytInitialPlayerResponse\s*=\s*)(\{[\s\S]*?\});(?:\s*(?:var\s+|window\[|<\/script>))/
      );
      if (m) {
        try {
          const parsed = JSON.parse(m[1]);
          details = parsed.videoDetails;
        } catch {
          // ignore
        }
      }

      if (!details) {
        const m2 = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});<\/script>/);
        if (m2) {
          try {
            const parsed = JSON.parse(m2[1]);
            details = parsed.videoDetails;
          } catch {
            // ignore
          }
        }
      }

      if (details && details.title) {
        const lengthSeconds = parseInt(details.lengthSeconds || "0", 10);
        const durationStr = formatDuration(lengthSeconds);
        const viewCount = parseInt(details.viewCount || "0", 10);
        const ep = extractEpisodeNumber(details.title);
        const tags = Array.isArray(details.keywords) ? details.keywords : [];
        const category = detectCategory(details.title, details.shortDescription || "", tags);

        return NextResponse.json(
          {
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
            source: "watch_page",
          },
          { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
        );
      }
    }
  } catch (err) {
    console.warn("Watch page scrape failed, trying Innertube:", err);
  }

  // Strategy 2: YouTube Innertube API with consent cookies
  try {
    const innerRes = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
      method: "POST",
      headers: {
        ...YOUTUBE_HEADERS,
        "Content-Type": "application/json",
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
      signal: AbortSignal.timeout(6000),
    });

    if (innerRes.ok) {
      const data = await innerRes.json();
      const details = data.videoDetails;

      if (details && details.title) {
        const lengthSeconds = parseInt(details.lengthSeconds || "0", 10);
        const durationStr = formatDuration(lengthSeconds);
        const viewCount = parseInt(details.viewCount || "0", 10);
        const ep = extractEpisodeNumber(details.title);
        const tags = Array.isArray(details.keywords) ? details.keywords : [];
        const category = detectCategory(details.title, details.shortDescription || "", tags);

        return NextResponse.json(
          {
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
            source: "innertube",
          },
          { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
        );
      }
    }
  } catch (err) {
    console.warn("Innertube failed, trying oEmbed:", err);
  }

  // Strategy 3: YouTube oEmbed with encoded URL
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`;
    const oembedRes = await fetch(oembedUrl, {
      headers: YOUTUBE_HEADERS,
      signal: AbortSignal.timeout(4000),
    });

    if (oembedRes.ok) {
      const odata = await oembedRes.json();
      if (odata && odata.title) {
        const ep = extractEpisodeNumber(odata.title);
        const category = detectCategory(odata.title, "");

        return NextResponse.json({
          success: true,
          id,
          title: odata.title,
          description: "",
          duration: "15:00",
          views: 0,
          viewsText: "0 views",
          thumbnailUrl: odata.thumbnail_url || getYoutubeThumbnail(id),
          episode: ep,
          suggestedCategory: category,
          tags: [],
          source: "oembed",
        });
      }
    }
  } catch (err) {
    console.warn("oEmbed failed, trying noembed:", err);
  }

  // Strategy 4: Noembed fallback
  try {
    const noembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`;
    const noembedRes = await fetch(noembedUrl, { signal: AbortSignal.timeout(4000) });
    if (noembedRes.ok) {
      const ndata = await noembedRes.json();
      if (ndata && ndata.title) {
        const ep = extractEpisodeNumber(ndata.title);
        const category = detectCategory(ndata.title, "");
        return NextResponse.json({
          success: true,
          id,
          title: ndata.title,
          description: "",
          duration: "15:00",
          views: 0,
          viewsText: "0 views",
          thumbnailUrl: ndata.thumbnail_url || getYoutubeThumbnail(id),
          episode: ep,
          suggestedCategory: category,
          tags: [],
          source: "noembed",
        });
      }
    }
  } catch (err) {
    console.warn("Noembed failed:", err);
  }

  return NextResponse.json(
    {
      success: false,
      error: "Could not retrieve details from YouTube",
    },
    { status: 404 }
  );
}
