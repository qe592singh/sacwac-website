import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { VideoModel } from "@/models/Video";
import { NoteModel } from "@/models/Note";
import { PlaylistModel } from "@/models/Playlist";
import {
  getStoredVideos,
  saveStoredVideos,
  getStoredNotes,
  saveStoredNotes,
  getStoredPlaylists,
  saveStoredPlaylists,
} from "@/lib/storage";
import { extractYoutubeId, getYoutubeThumbnail } from "@/lib/youtube";
import { formatVideoDate, getDynamicPlaylistTitle } from "@/lib/formatters";
import { Video, NoteDoc } from "@/types";

let cachedVideosData: { data: unknown; time: number } | null = null;
const CACHE_TTL_MS = 30 * 1000;

export async function GET() {
  if (cachedVideosData && Date.now() - cachedVideosData.time < CACHE_TTL_MS) {
    return NextResponse.json(cachedVideosData.data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
      },
    });
  }

  try {
    await connectToDatabase();
    const dbVideos = await VideoModel.find().sort({ order: 1, createdAt: -1 }).lean();
    if (dbVideos && dbVideos.length > 0) {
      const normalized = dbVideos.map((v) => ({
        ...v,
        date: formatVideoDate(v.date || v.publishedAt || (v as unknown as { createdAt?: string }).createdAt),
        publishedAt:
          v.publishedAt ||
          ((v as unknown as { createdAt?: Date }).createdAt
            ? new Date((v as unknown as { createdAt: Date }).createdAt).toISOString()
            : v.date
            ? new Date(v.date).toISOString()
            : new Date().toISOString()),
      }));
      const payload = { success: true, videos: normalized, source: "mongodb" };
      cachedVideosData = { data: payload, time: Date.now() };
      return NextResponse.json(payload, {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
        },
      });
    }
  } catch (err) {
    console.error("MongoDB GET videos error, falling back to JSON:", err);
  }

  const videos = getStoredVideos();
  const normalized = videos.map((v) => ({
    ...v,
    date: formatVideoDate(v.date || v.publishedAt),
    publishedAt: v.publishedAt || (v.date ? new Date(v.date).toISOString() : new Date().toISOString()),
  }));
  const localPayload = { success: true, videos: normalized, source: "local" };
  cachedVideosData = { data: localPayload, time: Date.now() };
  return NextResponse.json(localPayload, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
    },
  });
}

export async function POST(request: Request) {
  cachedVideosData = null;
  try {
    const body = await request.json();
    const {
      youtubeUrl,
      title,
      description,
      category,
      tags,
      difficulty,
      duration,
      episode,
      playlistId,
      notesContent,
      notesPdfUrl,
      notesTitle,
    } = body;

    if (!youtubeUrl) {
      return NextResponse.json(
        { success: false, error: "YouTube URL is required" },
        { status: 400 }
      );
    }

    const videoId = extractYoutubeId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: "Invalid YouTube URL format" },
        { status: 400 }
      );
    }

    let existingInDb = null;
    try {
      await connectToDatabase();
      existingInDb = await VideoModel.findOne({ youtubeId: videoId });
    } catch {
      // ignore
    }

    const currentVideos = getStoredVideos();
    const existingInLocal = currentVideos.find((v) => v.youtubeId === videoId);

    if (existingInDb || existingInLocal) {
      return NextResponse.json(
        { success: false, error: "This video has already been added to the library" },
        { status: 409 }
      );
    }

    const newVideoId = `vid-${videoId}`;
    let createdNoteId: string | undefined = undefined;

    // If notes content or notes PDF is provided, create the NoteDoc
    if (notesContent || notesPdfUrl) {
      createdNoteId = `note-${videoId}`;
      const newNote: NoteDoc = {
        id: createdNoteId,
        title: notesTitle?.trim() || `${title?.trim() || "Lesson"} Study Notes`,
        category: (category as NoteDoc["category"]) || "Admin",
        summary: `Comprehensive study notes and lesson architectural guide for ${title?.trim() || "this video"}.`,
        readTime: "12 min read",
        updatedAt: "Just now",
        badge: typeof episode === "number" ? `Episode ${episode} Guide` : "Lesson Notes",
        difficulty: (difficulty as NoteDoc["difficulty"]) || "Intermediate",
        sections: [
          {
            heading: "1. Key Concepts & Overview",
            content:
              notesContent?.trim() ||
              "Study notes and architecture review for this lesson.",
            keyTakeaways: ["Practice in a sandbox or developer environment."],
          },
        ],
        pdfUrl: notesPdfUrl?.trim() || undefined,
        videoId: newVideoId,
        episode: typeof episode === "number" ? episode : undefined,
        rawContent: notesContent?.trim() || undefined,
      };

      try {
        await connectToDatabase();
        await NoteModel.findOneAndUpdate({ id: createdNoteId }, newNote, {
          upsert: true,
          returnDocument: "after",
        });
      } catch (err) {
        console.error("Error creating attached note in MongoDB:", err);
      }

      const currentNotes = getStoredNotes();
      saveStoredNotes([newNote, ...currentNotes]);
    }

    const now = new Date();
    const finalDate = formatVideoDate(body.date || now);
    const finalPublishedAt = body.publishedAt || now.toISOString();

    const newVideo: Video = {
      id: newVideoId,
      youtubeUrl,
      youtubeId: videoId,
      title: title?.trim() || `Salesforce Deep-Dive: Episode ${currentVideos.length + 1}`,
      description:
        description?.trim() ||
        "In-depth Salesforce scenario breakdown and best practices by SacWac.",
      category: category || "Admin",
      duration: duration?.trim() || "15:00",
      thumbnailUrl: getYoutubeThumbnail(videoId),
      date: finalDate,
      publishedAt: finalPublishedAt,
      tags: Array.isArray(tags) && tags.length > 0 ? tags : ["Salesforce", category || "Tutorial"],
      difficulty: difficulty || "Intermediate",
      featured: false,
      episode: typeof episode === "number" ? episode : undefined,
      playlistId: playlistId || undefined,
      noteId: createdNoteId,
      hasNotes: Boolean(createdNoteId),
      notesContent: notesContent?.trim() || undefined,
    };

    // Save to MongoDB
    try {
      await connectToDatabase();
      await VideoModel.create({
        ...newVideo,
        order: -1,
      });

      // If video belongs to a playlist, automatically link it and dynamically update the title & count
      if (playlistId) {
        const pl = await PlaylistModel.findOne({ id: playlistId });
        if (pl) {
          const currentIds: string[] = pl.videoIds || [];
          if (!currentIds.includes(videoId)) {
            const updatedIds = [...currentIds, videoId];
            const updatedTitle = getDynamicPlaylistTitle({
              id: pl.id,
              title: pl.title,
              videoIds: updatedIds,
              totalEpisodes: updatedIds.length,
            });
            await PlaylistModel.updateOne(
              { id: playlistId },
              {
                $addToSet: { videoIds: videoId },
                $set: {
                  title: updatedTitle,
                  totalEpisodes: updatedIds.length,
                },
              }
            );
          }
        }
      }
    } catch (err) {
      console.error("Error creating video or updating playlist in MongoDB:", err);
    }

    // Also persist local fallback
    const updatedVideos = [newVideo, ...currentVideos];
    saveStoredVideos(updatedVideos);

    // If video belongs to playlist, also update local playlist file
    if (playlistId) {
      const storedPls = getStoredPlaylists();
      const updatedPls = storedPls.map((p) => {
        if (p.id === playlistId) {
          const currentIds = p.videoIds || [];
          const updatedIds = currentIds.includes(videoId) ? currentIds : [...currentIds, videoId];
          return {
            ...p,
            videoIds: updatedIds,
            totalEpisodes: updatedIds.length,
            title: getDynamicPlaylistTitle({
              id: p.id,
              title: p.title,
              videoIds: updatedIds,
              totalEpisodes: updatedIds.length,
            }),
          };
        }
        return p;
      });
      saveStoredPlaylists(updatedPls);
    }

    return NextResponse.json({
      success: true,
      message: "Video and attached notes published successfully!",
      video: newVideo,
    });
  } catch (error) {
    console.error("Failed to add video:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while adding video" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  cachedVideosData = null;
  try {
    const body = await request.json();
    const {
      videos,
      videoId,
      id,
      category,
      title,
      duration,
      difficulty,
      episode,
      action,
      notesContent,
      notesPdfUrl,
      notesTitle,
    } = body;

    const targetId = videoId || id;

    // Edit full video details & notes
    if (action === "edit" || (targetId && (title || category || duration || notesContent !== undefined || notesPdfUrl !== undefined))) {
      const updateData: Partial<Video> = {};
      if (title) updateData.title = title.trim();
      if (category) updateData.category = category;
      if (duration) updateData.duration = duration.trim();
      if (difficulty) updateData.difficulty = difficulty;
      if (episode !== undefined) updateData.episode = typeof episode === "number" ? episode : Number(episode) || undefined;
      if (notesContent !== undefined) updateData.notesContent = notesContent.trim();

      // Handle attached notes
      let resolvedNoteId: string | undefined = undefined;
      if (notesContent || notesPdfUrl) {
        resolvedNoteId = `note-${targetId.replace(/^vid-/, "")}`;
        updateData.noteId = resolvedNoteId;
        updateData.hasNotes = true;

        const noteUpdate: Partial<NoteDoc> = {
          id: resolvedNoteId,
          title: notesTitle?.trim() || `${updateData.title || "Lesson"} Study Notes`,
          category: (updateData.category || "Admin") as NoteDoc["category"],
          summary: `Study notes for ${updateData.title || targetId}.`,
          updatedAt: "Just updated",
          videoId: targetId,
          episode: updateData.episode,
          rawContent: notesContent?.trim() || undefined,
        };
        if (notesPdfUrl) noteUpdate.pdfUrl = notesPdfUrl.trim();
        if (notesContent) {
          noteUpdate.sections = [
            {
              heading: "1. Detailed Lesson Notes",
              content: notesContent.trim(),
              keyTakeaways: ["Review concepts and verify in Salesforce org."],
            },
          ];
        }

        try {
          await connectToDatabase();
          await NoteModel.findOneAndUpdate({ id: resolvedNoteId }, noteUpdate, {
            upsert: true,
            returnDocument: "after",
          });
        } catch (err) {
          console.error("MongoDB note update error in PUT video:", err);
        }

        const currentNotes = getStoredNotes();
        const noteIdx = currentNotes.findIndex((n) => n.id === resolvedNoteId || n.videoId === targetId);
        if (noteIdx !== -1) {
          currentNotes[noteIdx] = { ...currentNotes[noteIdx], ...noteUpdate };
        } else {
          currentNotes.unshift(noteUpdate as NoteDoc);
        }
        saveStoredNotes(currentNotes);
      }

      const mongoUpdate: { $set: Record<string, unknown>; $unset?: Record<string, string> } = {
        $set: updateData,
      };
      if (episode === "" || episode === null || updateData.episode === undefined) {
        mongoUpdate.$unset = { episode: "" };
        delete updateData.episode;
      }

      // Update in MongoDB
      try {
        await connectToDatabase();
        await VideoModel.findOneAndUpdate(
          { $or: [{ id: targetId }, { youtubeId: targetId }] },
          mongoUpdate,
          { returnDocument: "after" }
        );
      } catch (err) {
        console.error("MongoDB PUT video edit error:", err);
      }

      // Update local storage
      const currentVideos = getStoredVideos();
      const idx = currentVideos.findIndex((v) => v.id === targetId || v.youtubeId === targetId);
      if (idx !== -1) {
        if (episode === "" || episode === null) {
          delete currentVideos[idx].episode;
        }
        currentVideos[idx] = { ...currentVideos[idx], ...updateData };
        if (episode === "" || episode === null) {
          delete currentVideos[idx].episode;
        }
        saveStoredVideos(currentVideos);
        return NextResponse.json({
          success: true,
          message: "Video and notes updated successfully!",
          video: currentVideos[idx],
        });
      }

      return NextResponse.json({
        success: true,
        message: "Video and notes updated successfully!",
      });
    }

    // Single video category update
    if (targetId && category) {
      try {
        await connectToDatabase();
        await VideoModel.findOneAndUpdate(
          { $or: [{ id: targetId }, { youtubeId: targetId }] },
          { category }
        );
      } catch (err) {
        console.error("MongoDB PUT video category error:", err);
      }

      const currentVideos = getStoredVideos();
      const idx = currentVideos.findIndex((v) => v.id === targetId || v.youtubeId === targetId);
      if (idx !== -1) {
        currentVideos[idx] = {
          ...currentVideos[idx],
          category,
        };
        saveStoredVideos(currentVideos);
        return NextResponse.json({
          success: true,
          message: `Video category updated to ${category}`,
          video: currentVideos[idx],
        });
      }
      return NextResponse.json({
        success: true,
        message: `Video category updated to ${category}`,
      });
    }

    if (!Array.isArray(videos)) {
      return NextResponse.json(
        { success: false, error: "Videos must be an array or targetId provided" },
        { status: 400 }
      );
    }

    // Bulk reorder update
    try {
      await connectToDatabase();
      const bulkOps = videos.map((v: Video, index: number) => ({
        updateOne: {
          filter: { id: v.id },
          update: { $set: { order: index, category: v.category } },
        },
      }));
      if (bulkOps.length > 0) {
        await VideoModel.bulkWrite(bulkOps);
      }
    } catch (err) {
      console.error("MongoDB bulkWrite videos error:", err);
    }

    saveStoredVideos(videos);
    return NextResponse.json({ success: true, message: "Videos reordered successfully" });
  } catch (error) {
    console.error("Failed to update videos:", error);
    return NextResponse.json({ success: false, error: "Failed to update videos" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  cachedVideosData = null;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Video ID is required" },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();
      await VideoModel.deleteOne({ $or: [{ id }, { youtubeId: id }] });
    } catch (err) {
      console.error("MongoDB DELETE video error:", err);
    }

    const currentVideos = getStoredVideos();
    const updated = currentVideos.filter((v) => v.id !== id && v.youtubeId !== id);
    saveStoredVideos(updated);

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete video:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while deleting video" },
      { status: 500 }
    );
  }
}
