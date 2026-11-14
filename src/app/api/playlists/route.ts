import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { PlaylistModel } from "@/models/Playlist";
import { VideoModel } from "@/models/Video";
import { getStoredPlaylists, saveStoredPlaylists, getStoredVideos } from "@/lib/storage";
import { getDynamicPlaylistTitle } from "@/lib/formatters";
import { Playlist } from "@/types";

let cachedPlaylistsData: { data: unknown; time: number } | null = null;
const CACHE_TTL_MS = 30 * 1000;

export async function GET() {
  if (cachedPlaylistsData && Date.now() - cachedPlaylistsData.time < CACHE_TTL_MS) {
    return NextResponse.json(cachedPlaylistsData.data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
      },
    });
  }

  try {
    await connectToDatabase();
    const dbPlaylists = await PlaylistModel.find()
      .populate({
        path: "videos",
        model: VideoModel,
      })
      .lean();

    if (dbPlaylists && dbPlaylists.length > 0) {
      // Ensure each playlist's videos array is mapped properly and title is dynamic
      const formatted = dbPlaylists.map((p) => {
        const episodeCount = (p.videoIds && p.videoIds.length) || (p.videos ? p.videos.length : 0) || p.totalEpisodes || 0;
        return {
          id: p.id,
          title: getDynamicPlaylistTitle({
            id: p.id,
            title: p.title,
            videoIds: p.videoIds || [],
            videos: p.videos || [],
            totalEpisodes: episodeCount,
          }),
          slug: p.slug,
          description: p.description,
          category: p.category,
          level: p.level,
          totalEpisodes: episodeCount,
          thumbnail: p.thumbnail,
          videoIds: p.videoIds || [],
          videos: p.videos || [],
        };
      });
      const payload = { success: true, playlists: formatted, source: "mongodb" };
      cachedPlaylistsData = { data: payload, time: Date.now() };
      return NextResponse.json(payload, {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
        },
      });
    }
  } catch (err) {
    console.error("MongoDB GET playlists error, falling back to JSON:", err);
  }

  const playlists = getStoredPlaylists();
  const allVideos = getStoredVideos();

  const enriched = playlists.map((p) => {
    const playlistVideos = p.videoIds
      .map((vidId) => allVideos.find((v) => v.youtubeId === vidId || v.id === vidId))
      .filter(Boolean);

    const episodeCount = (p.videoIds && p.videoIds.length) || p.totalEpisodes || playlistVideos.length;

    return {
      ...p,
      title: getDynamicPlaylistTitle({
        id: p.id,
        title: p.title,
        videoIds: p.videoIds,
        totalEpisodes: episodeCount,
      }),
      totalEpisodes: episodeCount,
      videos: playlistVideos,
    };
  });

  const localPayload = { success: true, playlists: enriched, source: "local" };
  cachedPlaylistsData = { data: localPayload, time: Date.now() };
  return NextResponse.json(localPayload, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
    },
  });
}

export async function POST(request: Request) {
  cachedPlaylistsData = null;
  try {
    const body = await request.json();
    const { title, description, category, level, thumbnail } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const idSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const playlistId = `playlist-${Date.now()}`;

    const newPlaylist: Playlist = {
      id: playlistId,
      title: title.trim(),
      slug: idSlug,
      description: description?.trim() || "Complete Salesforce course series.",
      category: category || "General",
      level: level || "All Levels",
      totalEpisodes: 0,
      thumbnail: thumbnail || "https://img.youtube.com/vi/zuc9mfc0S6M/hqdefault.jpg",
      videoIds: [],
    };

    // Save in MongoDB
    try {
      await connectToDatabase();
      await PlaylistModel.create({
        ...newPlaylist,
        videos: [],
      });
    } catch (err) {
      console.error("MongoDB POST playlist error:", err);
    }

    // Also persist local fallback
    const playlists = getStoredPlaylists();
    const updated = [...playlists, newPlaylist];
    saveStoredPlaylists(updated);

    return NextResponse.json({
      success: true,
      message: "Playlist created successfully in MongoDB!",
      playlist: newPlaylist,
    });
  } catch (error) {
    console.error("Error creating playlist:", error);
    return NextResponse.json({ success: false, error: "Failed to create playlist" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  cachedPlaylistsData = null;
  try {
    const body = await request.json();
    const { playlistId, videoIds } = body;

    if (!playlistId || !Array.isArray(videoIds)) {
      return NextResponse.json(
        { success: false, error: "playlistId and videoIds array are required" },
        { status: 400 }
      );
    }

    // Resolve Mongo ObjectIds for the videoIds
    try {
      await connectToDatabase();
      const matchedVideos = await VideoModel.find({
        $or: [{ id: { $in: videoIds } }, { youtubeId: { $in: videoIds } }],
      });

      const videoMap = new Map();
      matchedVideos.forEach((v) => {
        videoMap.set(v.id, v._id);
        videoMap.set(v.youtubeId, v._id);
      });

      const objectIds = videoIds.map((id) => videoMap.get(id)).filter(Boolean);

      const existingPl = await PlaylistModel.findOne({ id: playlistId });
      const currentTitle = existingPl?.title || "";
      const updatedTitle = getDynamicPlaylistTitle({
        id: playlistId,
        title: currentTitle,
        videoIds,
        totalEpisodes: videoIds.length,
      });

      await PlaylistModel.findOneAndUpdate(
        { id: playlistId },
        {
          title: updatedTitle,
          videoIds,
          videos: objectIds,
          totalEpisodes: videoIds.length,
        }
      );
    } catch (err) {
      console.error("MongoDB PUT playlist error:", err);
    }

    // Also persist local fallback
    const playlists = getStoredPlaylists();
    const updated = playlists.map((p) =>
      p.id === playlistId
        ? {
            ...p,
            videoIds,
            totalEpisodes: videoIds.length,
            title: getDynamicPlaylistTitle({
              id: p.id,
              title: p.title,
              videoIds,
              totalEpisodes: videoIds.length,
            }),
          }
        : p
    );
    saveStoredPlaylists(updated);

    return NextResponse.json({ success: true, message: "Playlist updated successfully in MongoDB!" });
  } catch (error) {
    console.error("Error updating playlist:", error);
    return NextResponse.json({ success: false, error: "Failed to update playlist" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  cachedPlaylistsData = null;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Playlist ID required" }, { status: 400 });
    }

    try {
      await connectToDatabase();
      await PlaylistModel.deleteOne({ id });
    } catch (err) {
      console.error("MongoDB DELETE playlist error:", err);
    }

    const playlists = getStoredPlaylists();
    const updated = playlists.filter((p) => p.id !== id);
    saveStoredPlaylists(updated);

    return NextResponse.json({ success: true, message: "Playlist deleted successfully from MongoDB!" });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return NextResponse.json({ success: false, error: "Failed to delete playlist" }, { status: 500 });
  }
}

