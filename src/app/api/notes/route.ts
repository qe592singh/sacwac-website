import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { NoteModel } from "@/models/Note";
import { getStoredNotes, saveStoredNotes } from "@/lib/storage";
import { NoteDoc } from "@/types";

let cachedNotesData: { data: unknown; time: number } | null = null;
const CACHE_TTL_MS = 30 * 1000;

export async function GET() {
  if (cachedNotesData && Date.now() - cachedNotesData.time < CACHE_TTL_MS) {
    return NextResponse.json(cachedNotesData.data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
      },
    });
  }

  try {
    await connectToDatabase();
    const dbNotes = await NoteModel.find().sort({ order: 1, createdAt: -1 }).lean();
    if (dbNotes && dbNotes.length > 0) {
      const payload = { success: true, notes: dbNotes, source: "mongodb" };
      cachedNotesData = { data: payload, time: Date.now() };
      return NextResponse.json(payload, {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
        },
      });
    }
  } catch (err) {
    console.error("MongoDB GET notes error, falling back to JSON:", err);
  }

  const notes = getStoredNotes();
  const localPayload = { success: true, notes, source: "local" };
  cachedNotesData = { data: localPayload, time: Date.now() };
  return NextResponse.json(localPayload, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
    },
  });
}

export async function POST(request: Request) {
  cachedNotesData = null;
  try {
    const body = await request.json();
    const { title, category, summary, readTime, badge, difficulty, sections, pdfUrl, isFeatured, episode, videoId } = body;

    if (!title || (!pdfUrl && (!sections || sections.length === 0))) {
      return NextResponse.json(
        { success: false, error: "Title and a PDF document or content are required" },
        { status: 400 }
      );
    }

    const currentNotes = getStoredNotes();
    const idSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newNote: NoteDoc = {
      id: episode ? `admin-episode-${episode}` : `${idSlug}-${Date.now().toString().slice(-4)}`,
      title,
      category: category || "Admin",
      summary: summary || `Official ${category || "Salesforce"} study guide.`,
      readTime: readTime || "12 min read",
      updatedAt: "Just now",
      badge: badge || (episode ? `Episode ${episode} Guide` : "Study Guide"),
      difficulty: difficulty || "Intermediate",
      sections: Array.isArray(sections) ? sections : [],
      pdfUrl: pdfUrl || undefined,
      isFeatured: Boolean(isFeatured),
      episode: typeof episode === "number" ? episode : undefined,
      videoId: videoId || undefined,
    };

    // Save in MongoDB
    try {
      await connectToDatabase();
      await NoteModel.create({
        ...newNote,
        order: -1,
      });
    } catch (err) {
      console.error("MongoDB POST note error:", err);
    }

    // Also persist local fallback
    const updatedNotes = [newNote, ...currentNotes];
    saveStoredNotes(updatedNotes);

    return NextResponse.json({
      success: true,
      message: "Note document published successfully in MongoDB!",
      note: newNote,
    });
  } catch (error) {
    console.error("Failed to add note:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while saving note" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  cachedNotesData = null;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Note ID is required" },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();
      await NoteModel.deleteOne({ id });
    } catch (err) {
      console.error("MongoDB DELETE note error:", err);
    }

    const currentNotes = getStoredNotes();
    const updatedNotes = currentNotes.filter((n) => n.id !== id);
    saveStoredNotes(updatedNotes);

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully from MongoDB!",
    });
  } catch (error) {
    console.error("Failed to delete note:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while deleting note" },
      { status: 500 }
    );
  }
}
