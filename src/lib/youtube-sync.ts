import { connectToDatabase } from "@/lib/mongodb";
import { VideoModel } from "@/models/Video";
import { PlaylistModel } from "@/models/Playlist";
import {
  getStoredVideos,
  saveStoredVideos,
  saveStoredPlaylists,
} from "@/lib/storage";
import { getYoutubeThumbnail } from "@/lib/youtube";
import { formatVideoDate, getDynamicPlaylistTitle } from "@/lib/formatters";
import { Video, Playlist } from "@/types";

export function parseIsoDuration(iso?: string): string {
  if (!iso || !iso.startsWith("PT")) return "15:00";
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = iso.match(regex);
  if (!matches) return "15:00";
  const hours = parseInt(matches[1] || "0", 10);
  const minutes = parseInt(matches[2] || "0", 10);
  const seconds = parseInt(matches[3] || "0", 10);
  if (hours > 0) {
    return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export function detectCategory(title: string, desc: string = "", tags: string[] = []): Video["category"] {
  const combined = `${title} ${desc} ${tags.join(" ")}`.toLowerCase();
  if (/flow|screen flow|record-triggered|schedule-triggered|autolaunched/.test(combined)) return "Flows";
  if (/security|permission set|profile|sharing rule|owd|mfa|authenticator/.test(combined)) return "Security";
  if (/apex|trigger|test class|soql|sosl|batch apex|future/.test(combined)) return "Apex";
  if (/validation rule/.test(combined)) return "Validation Rules";
  if (/scenario|interview/.test(combined)) return "Scenarios";
  if (/integration|rest api|named credential|client credential/.test(combined)) return "Integration";
  if (/admin|object|field|page layout|app builder/.test(combined)) return "Admin";
  return "General";
}

export function detectPlaylistId(category: Video["category"], title: string): string | undefined {
  const lower = title.toLowerCase();
  if (category === "Flows" && /flow|element|trigger|screen|schedule|autolaunch/.test(lower)) return "playlist-flows";
  if (category === "Security" && /security|mfa|permission|profile|owd|authenticator/.test(lower)) return "playlist-security";
  if (category === "Admin" && /admin|lesson|course/.test(lower)) return "playlist-admin";
  return undefined;
}

export function isLiveStream(title: string, desc: string = ""): boolean {
  const text = `${title} ${desc}`.toLowerCase();
  return (
    /live\s*stream|livestream|\blive\s*session|\blive\b.*stream/i.test(text) ||
    title.toLowerCase().startsWith("sacwac live")
  );
}

export function extractEpisodeNumber(text: string): number | undefined {
  const match = text.match(/(?:Episode|Ep\.?|Lesson|Part|#)\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : undefined;
}

export async function fetchVideoDetailsFromApi(videoId: string, apiKey: string) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`YouTube API returned status ${res.status}`);
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return null;

  const title = item.snippet?.title || "";
  const description = item.snippet?.description || "";

  // Completely filter out live streams
  if (item.snippet?.liveBroadcastContent && item.snippet.liveBroadcastContent !== "none") {
    return null;
  }
  if (isLiveStream(title, description)) {
    return null;
  }

  const tags: string[] = item.snippet?.tags || [];
  const publishedAt = item.snippet?.publishedAt || new Date().toISOString();
  const duration = parseIsoDuration(item.contentDetails?.duration);
  const views = parseInt(item.statistics?.viewCount || "0", 10);
  const viewsText = `${views.toLocaleString()} views`;
  const episode = extractEpisodeNumber(title);
  const category = detectCategory(title, description, tags);
  const playlistId = detectPlaylistId(category, title);

  return {
    videoId,
    title,
    description,
    tags,
    publishedAt,
    date: formatVideoDate(publishedAt),
    duration,
    views,
    viewsText,
    thumbnailUrl: getYoutubeThumbnail(videoId),
    episode,
    category,
    playlistId,
  };
}

export async function syncYouTubePlaylists(apiKey: string, channelId: string): Promise<Playlist[]> {
  console.log(`[YouTube Sync] Fetching channel playlists for ${channelId}`);
  const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${channelId}&maxResults=50&key=${apiKey}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) {
    console.warn("Failed to fetch playlists from YouTube:", res.status);
    return [];
  }

  const data = await res.json();
  const ytPlaylists = data.items || [];
  const syncedPlaylists: Playlist[] = [];

  for (const item of ytPlaylists) {
    const rawTitle = item.snippet?.title || "";
    const ytPlId = item.id;
    if (!rawTitle || rawTitle.toLowerCase().includes("deleted video") || isLiveStream(rawTitle)) continue;

    // Fetch all video IDs for this playlist with pagination
    let videoIds: string[] = [];
    let pageToken = "";
    try {
      do {
        const pUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${ytPlId}&maxResults=50&pageToken=${pageToken}&key=${apiKey}`;
        const pRes = await fetch(pUrl, { signal: AbortSignal.timeout(8000) });
        if (!pRes.ok) break;
        const pData = await pRes.json();
        if (pData.items) {
          const ids = pData.items
            .map((it: { contentDetails?: { videoId?: string } }) => it.contentDetails?.videoId)
            .filter((id: string | undefined): id is string => Boolean(id));
          videoIds = videoIds.concat(ids);
        }
        pageToken = pData.nextPageToken || "";
      } while (pageToken);
    } catch (err) {
      console.warn(`Error fetching items for playlist ${ytPlId}:`, err);
    }

    if (videoIds.length === 0) continue;

    // Map known playlists to stable IDs so existing URLs don't break
    let plId = `playlist-${ytPlId}`;
    let cat: Playlist["category"] = "General";
    let level = "Beginner to Advanced";
    const lower = rawTitle.toLowerCase();

    if (ytPlId === "PLTIllWXwXDP8" || lower.includes("flow")) {
      plId = "playlist-flows";
      cat = "Flows";
      level = "Beginner to Advanced";
    } else if (ytPlId === "PLQysHSU2Axfo" || lower.includes("security")) {
      plId = "playlist-security";
      cat = "Security";
      level = "Intermediate to Advanced";
    } else if (ytPlId === "PLcGu3X7SBqX0" || lower.includes("administrator") || lower.includes("admin")) {
      plId = "playlist-admin";
      cat = "Admin";
      level = "Beginner to Advanced";
    } else if (lower.includes("apex")) {
      const cleanSlug = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      plId = `playlist-${cleanSlug}`;
      cat = "Apex";
      level = "Intermediate to Advanced";
    } else if (lower.includes("integration") || lower.includes("client app")) {
      const cleanSlug = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      plId = `playlist-${cleanSlug}`;
      cat = "Integration";
      level = "Advanced";
    } else {
      const cleanSlug = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      plId = `playlist-${cleanSlug}`;
      cat = "General";
      level = "All Levels";
    }

    const slug = plId.replace(/^playlist-/, "") || ytPlId;
    const thumbnail =
      item.snippet?.thumbnails?.high?.url ||
      item.snippet?.thumbnails?.medium?.url ||
      `https://img.youtube.com/vi/${videoIds[0]}/hqdefault.jpg`;

    const description =
      item.snippet?.description?.trim() ||
      `Complete ${rawTitle} course playlist by Sachin Singh on SacWac.`;

    const dynamicTitle = getDynamicPlaylistTitle({
      id: plId,
      title: rawTitle,
      videoIds,
      totalEpisodes: videoIds.length,
    });

    syncedPlaylists.push({
      id: plId,
      title: dynamicTitle,
      slug,
      description,
      category: cat,
      level,
      totalEpisodes: videoIds.length,
      thumbnail,
      videoIds,
    });
  }

  return syncedPlaylists;
}

export async function syncYouTubeChannel(options: { maxResults?: number } = {}) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID || "UCij5b5F7FxChHGPVoVgREmQ";
  const uploadsPlaylistId =
    process.env.YOUTUBE_UPLOADS_PLAYLIST_ID ||
    (channelId.replace(/^UC/, "UU"));

  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY environment variable is not configured");
  }

  const maxResults = options.maxResults || 35;
  console.log(`[YouTube Sync] Starting channel sync with playlist: ${uploadsPlaylistId}`);
  const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`;

  const res = await fetch(playlistUrl, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`YouTube API playlistItems error: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  const items = data.items || [];
  if (items.length === 0) {
    return { success: true, addedCount: 0, updatedCount: 0, playlistsSynced: 0, addedVideos: [] };
  }

  // Connect to DB and fetch existing videos
  let dbConnected = false;
  let dbVideos: Video[] = [];
  try {
    await connectToDatabase();
    dbConnected = true;
    dbVideos = (await VideoModel.find().lean()) as unknown as Video[];
  } catch (err) {
    console.warn("MongoDB connection failed in sync, using local storage:", err);
  }

  const localVideos = getStoredVideos();
  const existingMap = new Map<string, Video>();
  for (const v of localVideos) existingMap.set(v.youtubeId, v);
  for (const v of dbVideos) existingMap.set(v.youtubeId, v);

  const newVideoIds: string[] = [];
  const existingVideoIdsToRefresh: string[] = [];

  // Purge any legacy live stream videos from MongoDB if present
  if (dbConnected) {
    try {
      await VideoModel.deleteMany({
        $or: [
          { title: { $regex: /live\s*stream/i } },
          { title: { $regex: /^sacwac\s*live/i } },
          { youtubeId: "X5BoxFFhBVs" },
        ],
      });
    } catch {
      // ignore
    }
  }

  for (const item of items) {
    const vId = item.contentDetails?.videoId;
    if (!vId) continue;
    const itemTitle = item.snippet?.title || "";
    if (isLiveStream(itemTitle)) continue;
    if (existingMap.has(vId)) {
      existingVideoIdsToRefresh.push(vId);
    } else {
      newVideoIds.push(vId);
    }
  }

  console.log(`[YouTube Sync] Found ${newVideoIds.length} new videos to add:`, newVideoIds);
  const addedVideos: Video[] = [];

  // Fetch full details for new videos and insert
  for (const vId of newVideoIds) {
    try {
      const details = await fetchVideoDetailsFromApi(vId, apiKey);
      if (!details) continue;

      const newVideo: Video = {
        id: `vid-${vId}`,
        youtubeUrl: `https://www.youtube.com/watch?v=${vId}`,
        youtubeId: vId,
        title: details.title,
        description: details.description,
        category: details.category,
        duration: details.duration,
        thumbnailUrl: details.thumbnailUrl,
        date: details.date,
        publishedAt: details.publishedAt,
        views: details.views,
        viewsText: details.viewsText,
        tags: details.tags.length > 0 ? details.tags : ["Salesforce", details.category],
        difficulty: "Intermediate",
        featured: false,
        episode: details.episode,
        playlistId: details.playlistId,
      };

      // Save to MongoDB
      if (dbConnected) {
        try {
          await VideoModel.findOneAndUpdate(
            { youtubeId: vId },
            { ...newVideo, order: -1 },
            { upsert: true, returnDocument: "after" }
          );

          if (details.playlistId) {
            const pl = await PlaylistModel.findOne({ id: details.playlistId });
            if (pl) {
              const currentIds: string[] = pl.videoIds || [];
              if (!currentIds.includes(vId)) {
                const updatedIds = [...currentIds, vId];
                const updatedTitle = getDynamicPlaylistTitle({
                  id: pl.id,
                  title: pl.title,
                  videoIds: updatedIds,
                  totalEpisodes: updatedIds.length,
                });
                const savedDoc = await VideoModel.findOne({ youtubeId: vId }).lean();
                const updateOp: Record<string, unknown> = {
                  $addToSet: { videoIds: vId } as Record<string, unknown>,
                  $set: {
                    title: updatedTitle,
                    totalEpisodes: updatedIds.length,
                  },
                };
                if (savedDoc && savedDoc._id) {
                  (updateOp.$addToSet as Record<string, unknown>).videos = savedDoc._id;
                }
                await PlaylistModel.updateOne({ id: details.playlistId }, updateOp);
              }
            }
          }
        } catch (dbErr) {
          console.error(`Error saving new video ${vId} to MongoDB:`, dbErr);
        }
      }

      // Save to local storage
      const currentLocals = getStoredVideos();
      if (!currentLocals.some((v) => v.youtubeId === vId)) {
        saveStoredVideos([newVideo, ...currentLocals]);
      }

      addedVideos.push(newVideo);
      existingMap.set(vId, newVideo);
    } catch (err) {
      console.error(`Failed to fetch details for new video ${vId}:`, err);
    }
  }

  // Refresh view counts for ALL existing videos in chunks of 50
  let updatedCount = 0;
  if (existingVideoIdsToRefresh.length > 0) {
    for (let i = 0; i < existingVideoIdsToRefresh.length; i += 50) {
      const batch = existingVideoIdsToRefresh.slice(i, i + 50);
      try {
        const batchUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${batch.join(",")}&key=${apiKey}`;
        const batchRes = await fetch(batchUrl, { signal: AbortSignal.timeout(8000) });
        if (batchRes.ok) {
          const batchData = await batchRes.json();
          const statsItems = batchData.items || [];

          for (const s of statsItems) {
            const vid = s.id;
            const count = parseInt(s.statistics?.viewCount || "0", 10);
            const text = `${count.toLocaleString()} views`;

            if (dbConnected) {
              await VideoModel.updateOne(
                { youtubeId: vid },
                { $set: { views: count, viewsText: text } }
              );
            }

            const existingLocal = existingMap.get(vid);
            if (existingLocal) {
              existingLocal.views = count;
              existingLocal.viewsText = text;
              updatedCount++;
            }
          }
        }
      } catch (err) {
        console.warn("Failed to refresh batch statistics:", err);
      }
    }

    // Persist refreshed local videos
    saveStoredVideos(Array.from(existingMap.values()));
  }

  // Auto-sync ALL channel playlists from YouTube
  let playlistsSyncedCount = 0;
  try {
    const channelPlaylists = await syncYouTubePlaylists(apiKey, channelId);
    if (channelPlaylists && channelPlaylists.length > 0) {
      // Find video ObjectIds for MongoDB linking
      if (dbConnected) {
        for (const pl of channelPlaylists) {
          const matchingVideoDocs = await VideoModel.find({ youtubeId: { $in: pl.videoIds } }).lean();
          const objIds = matchingVideoDocs.map((d) => d._id);

          await PlaylistModel.findOneAndUpdate(
            { id: pl.id },
            {
              ...pl,
              videos: objIds,
            },
            { upsert: true, returnDocument: "after" }
          );
        }
      }

      // Persist to local playlists.json
      saveStoredPlaylists(channelPlaylists);
      playlistsSyncedCount = channelPlaylists.length;
      console.log(`[YouTube Sync] Synced ${playlistsSyncedCount} playlists successfully!`);
    }
  } catch (plErr) {
    console.error("Error syncing YouTube playlists:", plErr);
  }

  return {
    success: true,
    addedCount: addedVideos.length,
    updatedCount,
    playlistsSynced: playlistsSyncedCount,
    addedVideos,
  };
}
