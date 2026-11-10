import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { NoteModel } from "@/models/Note";
import { getStoredNotes, saveStoredNotes } from "@/lib/storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await connectToDatabase();
    const dbNote = await NoteModel.findOneAndUpdate(
      { id },
      { $inc: { viewsCount: 1 } },
      { returnDocument: "after" }
    ).lean();

    if (dbNote) {
      return NextResponse.json({ success: true, note: dbNote, source: "mongodb" });
    }
  } catch (err) {
    console.error("MongoDB GET note by id error, falling back to JSON:", err);
  }

  const notes = getStoredNotes();
  const noteIndex = notes.findIndex((n) => n.id === id);

  if (noteIndex === -1) {
    return NextResponse.json(
      { success: false, error: "Note not found" },
      { status: 404 }
    );
  }

  // Increment view counter
  notes[noteIndex].viewsCount = (notes[noteIndex].viewsCount || 0) + 1;
  saveStoredNotes(notes);

  return NextResponse.json({ success: true, note: notes[noteIndex], source: "local" });
}
