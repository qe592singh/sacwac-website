import fs from "fs";
import path from "path";
import { Video, NoteDoc, Playlist } from "@/types";

const dataDir = path.join(process.cwd(), "src", "data");
const videosFilePath = path.join(dataDir, "videos.json");
const notesFilePath = path.join(dataDir, "notes.json");
const playlistsFilePath = path.join(dataDir, "playlists.json");

export function getStoredVideos(): Video[] {
  try {
    if (!fs.existsSync(videosFilePath)) {
      return [];
    }
    const data = fs.readFileSync(videosFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading videos file:", err);
    return [];
  }
}

export function saveStoredVideos(videos: Video[]): boolean {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(videosFilePath, JSON.stringify(videos, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error saving videos file:", err);
    return false;
  }
}

export function getStoredNotes(): NoteDoc[] {
  try {
    if (!fs.existsSync(notesFilePath)) {
      return [];
    }
    const data = fs.readFileSync(notesFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading notes file:", err);
    return [];
  }
}

export function saveStoredNotes(notes: NoteDoc[]): boolean {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error saving notes file:", err);
    return false;
  }
}

export function getStoredPlaylists(): Playlist[] {
  try {
    if (!fs.existsSync(playlistsFilePath)) {
      return [];
    }
    const data = fs.readFileSync(playlistsFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading playlists file:", err);
    return [];
  }
}
