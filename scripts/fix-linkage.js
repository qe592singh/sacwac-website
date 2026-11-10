const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://sacwacsalesforce_db_user:h69WbIsgStKWMGWc@sacwac.fsn0zaz.mongodb.net/sacwac?retryWrites=true&w=majority";

async function fix() {
  await mongoose.connect(MONGODB_URI);
  const VideoModel = mongoose.models.Video || mongoose.model("Video", new mongoose.Schema({}, { strict: false }));
  const NoteModel = mongoose.models.NoteDoc || mongoose.model("NoteDoc", new mongoose.Schema({}, { strict: false }));

  const videosPath = path.join(__dirname, "../src/data/videos.json");
  const notesPath = path.join(__dirname, "../src/data/notes.json");
  const videos = JSON.parse(fs.readFileSync(videosPath, "utf-8"));
  const notes = JSON.parse(fs.readFileSync(notesPath, "utf-8"));

  // Clear noteId on apex videos
  for (const v of videos) {
    if (v.id.startsWith("vid-s5x5ZNptIjY") || v.id.startsWith("vid-Z8sEbyEw7Bs") || v.id.startsWith("vid-EGV9eiWyBMg")) {
      delete v.noteId;
      v.hasNotes = false;
      await VideoModel.updateOne({ id: v.id }, { $unset: { noteId: 1 }, $set: { hasNotes: false } });
    }
  }

  // Map each episode 1..39 to the exact Admin course video
  const adminVids = videos.filter((x) => x.category === "Admin" || x.playlistId === "playlist-admin");
  for (let ep = 1; ep <= 39; ep++) {
    const noteId = "admin-episode-" + ep;
    const match = adminVids.find((x) => {
      const m = x.title.match(/Episode\s*(\d+)/i);
      return m && parseInt(m[1]) === ep;
    });

    if (match) {
      match.episode = ep;
      match.noteId = noteId;
      match.hasNotes = true;
      await VideoModel.updateOne({ id: match.id }, { $set: { episode: ep, noteId: noteId, hasNotes: true } });

      // Update Note videoId
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        note.videoId = match.id;
        note.episode = ep;
        await NoteModel.updateOne({ id: noteId }, { $set: { videoId: match.id, episode: ep } });
      }
      console.log(`Fixed Ep ${ep} -> Video ${match.id} (${match.title.slice(0, 45)}...)`);
    }
  }

  // Fix bonus videos
  const ep0 = adminVids.find((x) => x.id === "vid-Ej1n9Wve69Q");
  if (ep0) {
    ep0.episode = 0;
    await VideoModel.updateOne({ id: ep0.id }, { $set: { episode: 0 } });
  }

  fs.writeFileSync(videosPath, JSON.stringify(videos, null, 2), "utf-8");
  fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2), "utf-8");
  console.log("Successfully verified and fixed video linkage!");
  process.exit(0);
}

fix().catch((err) => {
  console.error(err);
  process.exit(1);
});
