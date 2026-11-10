"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NoteDoc, Playlist, Video } from "@/types";
import {
  Search,
  ShieldCheck,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Share2,
  Check,
  Layers,
  BookOpen,
  Play,
  X,
  AlertTriangle,
  Lock
} from "lucide-react";

interface EnrichedPlaylist extends Playlist {
  videos: Video[];
}

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteDoc[]>([]);
  const [playlists, setPlaylists] = useState<EnrichedPlaylist[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Playlist & Active Note
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("playlist-admin");
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // Search filter for notes in playlist
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Active note scroll ref
  const activeNoteItemRef = useRef<HTMLDivElement | null>(null);

  // Keyboard shortcut listener to prevent Print, Save, Copy
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["p", "P", "s", "S", "c", "C", "u", "U"].includes(e.key)
      ) {
        e.preventDefault();
      }
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    Promise.all([
      fetch("/api/notes").then((r) => r.json()),
      fetch("/api/playlists").then((r) => r.json()),
      fetch("/api/videos").then((r) => r.json()),
    ])
      .then(([nData, pData, vData]) => {
        if (nData.success && nData.notes) setNotes(nData.notes);
        if (pData.success && pData.playlists) setPlaylists(pData.playlists);
        if (vData.success && vData.videos) setVideos(vData.videos);

        // Check URL query params or hash
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const qPl = params.get("playlist");
          const qNote = params.get("note");
          const hashNote = window.location.hash.replace("#note-", "");

          if (qPl && pData.playlists?.some((p: Playlist) => p.id === qPl)) {
            setSelectedPlaylistId(qPl);
          }

          if (qNote || hashNote) {
            const targetId = qNote || hashNote;
            setActiveNoteId(targetId);
          }
        }
      })
      .catch((err) => console.error("Error loading notes hub data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Currently selected playlist object
  const activePlaylist = useMemo(() => {
    return playlists.find((p) => p.id === selectedPlaylistId) || playlists[0] || null;
  }, [playlists, selectedPlaylistId]);

  // Notes belonging to the selected playlist (strictly sorted by episode)
  const playlistNotes = useMemo(() => {
    if (!activePlaylist) {
      return [...notes].sort((a, b) => (a.episode ?? 999) - (b.episode ?? 999));
    }

    if (activePlaylist.id === "all") {
      return [...notes].sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return (a.episode ?? 999) - (b.episode ?? 999);
      });
    }

    return notes
      .filter((n) => {
        if (n.category === activePlaylist.category) return true;
        if (activePlaylist.videoIds?.some((vId) => n.videoId === vId || n.videoId === `vid-${vId}`)) {
          return true;
        }
        return false;
      })
      .sort((a, b) => (a.episode ?? 999) - (b.episode ?? 999));
  }, [notes, activePlaylist]);

  // Filter notes by search query
  const filteredPlaylistNotes = useMemo(() => {
    if (!searchQuery.trim()) return playlistNotes;
    const q = searchQuery.toLowerCase();
    return playlistNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        (n.episode !== undefined && String(n.episode).includes(q))
    );
  }, [playlistNotes, searchQuery]);

  // Active Note
  const activeNote = useMemo(() => {
    if (activeNoteId) {
      const found = playlistNotes.find((n) => n.id === activeNoteId);
      if (found) return found;
      // Fallback search in all notes
      const inAll = notes.find((n) => n.id === activeNoteId);
      if (inAll) return inAll;
    }
    return playlistNotes[0] || null;
  }, [playlistNotes, activeNoteId, notes]);

  // Set active note id when playlist changes if active note is not in playlist
  useEffect(() => {
    if (playlistNotes.length > 0) {
      if (!activeNoteId || !playlistNotes.some((n) => n.id === activeNoteId)) {
        setActiveNoteId(playlistNotes[0].id);
      }
    }
  }, [playlistNotes, activeNoteId]);

  // Index of active note in current playlist
  const currentNoteIndex = useMemo(() => {
    if (!activeNote) return -1;
    return playlistNotes.findIndex((n) => n.id === activeNote.id);
  }, [playlistNotes, activeNote]);

  const prevNote = currentNoteIndex > 0 ? playlistNotes[currentNoteIndex - 1] : null;
  const nextNote =
    currentNoteIndex >= 0 && currentNoteIndex < playlistNotes.length - 1
      ? playlistNotes[currentNoteIndex + 1]
      : null;

  // Find linked video for this note if any
  const linkedVideo = useMemo(() => {
    if (!activeNote) return null;
    return videos.find((v) => {
      if (activeNote.videoId && (v.id === activeNote.videoId || v.youtubeId === activeNote.videoId)) {
        return true;
      }
      if (v.noteId === activeNote.id) return true;
      if (
        v.hasNotes &&
        typeof v.episode === "number" &&
        v.episode === activeNote.episode &&
        v.category === activeNote.category
      ) {
        return true;
      }
      return false;
    });
  }, [activeNote, videos]);

  const handleShare = () => {
    if (typeof window !== "undefined" && activeNote) {
      const url = `${window.location.origin}/notes?playlist=${selectedPlaylistId}&note=${activeNote.id}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSelectPlaylist = (plId: string) => {
    setSelectedPlaylistId(plId);
    setSearchQuery("");
  };

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200 select-none"
    >
      <Navbar />

      <main className="flex-1 max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 w-full">
        {/* ================= TOP SECTION: HEADER & SECURITY BADGE ================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> SacWac Architectural Study Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Course Study Notes & PDF Guides
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-1">
              Read complete lesson notes and architectural PDF guides online in high-definition. Browse playlist-by-playlist or jump directly between lessons.
            </p>
          </div>

          {/* Protection & Count Badges */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-1.5 shadow-sm">
              <Lock className="w-3.5 h-3.5" />
              <span>Anti-Copy Protected</span>
            </span>

            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>{notes.length} Total Study Guides</span>
            </span>
          </div>
        </div>

        {/* ================= PLAYLIST SELECTOR PICKLIST (REPLACING HORIZONTAL SLIDER) ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-sky-600 text-white rounded-xl shadow-sm shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Course Playlist
              </div>
              <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                {activePlaylist ? activePlaylist.title : "All SacWac Study Guides"}
              </div>
            </div>
          </div>

          {/* Clean Picklist Dropdown */}
          <div className="relative w-full sm:w-auto min-w-[280px] sm:min-w-[360px]">
            <select
              value={selectedPlaylistId}
              onChange={(e) => handleSelectPlaylist(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-sm"
            >
              {playlists.map((pl) => {
                const count = notes.filter((n) => n.category === pl.category).length;
                return (
                  <option key={pl.id} value={pl.id}>
                    {pl.title} ({count} Guides)
                  </option>
                );
              })}
              <option value="all">All Study Guides ({notes.length} Total Guides)</option>
            </select>
          </div>
        </div>

        {/* ================= MAIN SPLIT INTERFACE ================= */}
        {loading ? (
          <div className="py-24 text-center text-slate-500 font-medium">
            Loading SacWac Study Notes Hub...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ================= LEFT COLUMN: EMBEDDED PDF VIEWER ================= */}
            <div className="lg:col-span-8 space-y-4">
              {activeNote ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col">
                  {/* Top Bar inside reader */}
                  <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {activeNote.episode !== undefined && (
                            <span className="px-2.5 py-0.5 text-[11px] font-extrabold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 rounded-md">
                              Episode {activeNote.episode}
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md">
                            {activeNote.category}
                          </span>
                          <span className="text-xs text-slate-400 hidden sm:inline flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" /> {activeNote.readTime}
                          </span>
                        </div>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate max-w-md sm:max-w-xl">
                          {activeNote.title}
                        </h2>
                      </div>
                    </div>

                    {/* Action Buttons (Download & Open in New Tab removed for protection) */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Previous / Next Note Buttons */}
                      {prevNote && (
                        <button
                          onClick={() => setActiveNoteId(prevNote.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors"
                          title="Previous Lesson Guide"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" /> Prev
                        </button>
                      )}

                      {nextNote && (
                        <button
                          onClick={() => setActiveNoteId(nextNote.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-sm flex items-center gap-1 transition-all hover:scale-105 active:scale-95"
                          title="Next Lesson Guide"
                        >
                          Next <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Share Link */}
                      <button
                        onClick={handleShare}
                        className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors"
                        title="Copy direct link to this study note"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="hidden sm:inline">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Share</span>
                          </>
                        )}
                      </button>

                      {/* Fullscreen Reader Toggle */}
                      <button
                        onClick={() => setIsFullscreen(true)}
                        className="p-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors"
                        title="Open Fullscreen Reader"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Main Embedded Protected PDF Canvas */}
                  <div
                    onContextMenu={(e) => e.preventDefault()}
                    className="relative w-full h-[650px] sm:h-[800px] bg-slate-950 flex flex-col select-none"
                  >
                    {activeNote.pdfUrl ? (
                      <iframe
                        key={activeNote.id}
                        src={`${activeNote.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        title={activeNote.title}
                        className="w-full flex-1 border-0 bg-slate-950 pointer-events-auto"
                      />
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 text-slate-400">
                        <AlertTriangle className="w-12 h-12 text-amber-500" />
                        <h3 className="text-lg font-bold text-white">Notes Not Uploaded for this Episode</h3>
                        <p className="text-xs text-slate-400 max-w-md">
                          Notes not uploaded for this episode
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Guide Summary & Video Link */}
                  <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
                        Executive Guide Summary
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                        {activeNote.summary}
                      </p>
                    </div>

                    {/* Linked Video Watch CTA */}
                    {linkedVideo && (
                      <Link
                        href={`/watch/${linkedVideo.youtubeId}${activePlaylist ? `?list=${activePlaylist.id}` : ""}`}
                        className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-600/20 flex items-center gap-2 shrink-0 transition-all hover:scale-105 active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch Lesson Video</span>
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    No study notes found in this playlist
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select another playlist or explore all available guides above.
                  </p>
                </div>
              )}
            </div>

            {/* ================= RIGHT COLUMN: PLAYLIST NOTES QUEUE ================= */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                {/* Playlist Sidebar Header */}
                <div className="p-4 sm:p-5 bg-slate-100/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Playlist Guides
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {currentNoteIndex >= 0 ? `${currentNoteIndex + 1} / ` : ""}
                      {playlistNotes.length} Guides
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {activePlaylist ? activePlaylist.title : "All SacWac Study Notes"}
                  </h3>

                  {/* Search inside this playlist */}
                  <div className="relative pt-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="Search this course guides..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Playlist Note Items List */}
                <div className="max-h-[720px] overflow-y-auto p-2 space-y-2 scrollbar-thin">
                  {filteredPlaylistNotes.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No study guides match your search in this course.
                    </div>
                  ) : (
                    filteredPlaylistNotes.map((note, idx) => {
                      const isActive = activeNote?.id === note.id;
                      const epNum = note.episode !== undefined ? note.episode : idx + 1;
                      return (
                        <div
                          key={note.id}
                          ref={isActive ? activeNoteItemRef : null}
                          onClick={() => setActiveNoteId(note.id)}
                          className={`p-3.5 rounded-2xl flex items-start gap-3 transition-all cursor-pointer border ${
                            isActive
                              ? "bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-950 dark:text-emerald-200 shadow-sm"
                              : "bg-white dark:bg-slate-900/60 border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {/* Episode Badge on Left */}
                          <div
                            className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-extrabold text-xs shrink-0 ${
                              isActive
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <span className="text-[9px] uppercase tracking-tighter opacity-80 leading-none">Ep</span>
                            <span className="text-sm font-black leading-tight">{epNum}</span>
                          </div>

                          {/* Title & Details with prominent Episode Tag */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                Episode {epNum}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {note.category}
                              </span>
                            </div>

                            <h4
                              className={`text-xs font-bold line-clamp-2 leading-snug ${
                                isActive
                                  ? "text-emerald-800 dark:text-emerald-300"
                                  : "text-slate-900 dark:text-slate-200"
                              }`}
                            >
                              {note.title}
                            </h4>

                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> {note.readTime}
                              </span>
                              {note.pdfUrl && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                    Protected PDF
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Active Indicator Icon */}
                          {isActive && (
                            <div className="shrink-0 text-emerald-600 dark:text-emerald-400 pt-1">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= FULLSCREEN MODAL OVERLAY (PROTECTED) ================= */}
      {isFullscreen && activeNote && (
        <div
          onContextMenu={(e) => e.preventDefault()}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-150 select-none"
        >
          <div className="px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px]">
                  {activeNote.episode !== undefined && (
                    <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                      Episode {activeNote.episode}
                    </span>
                  )}
                  <span className="text-emerald-400 font-semibold">{activeNote.category} Study Guide</span>
                  <span className="text-slate-400 hidden sm:inline">• Protected Document</span>
                </div>
                <h3 className="text-sm font-bold text-white truncate max-w-2xl">{activeNote.title}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                title="Exit Fullscreen"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                title="Close Viewer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            onContextMenu={(e) => e.preventDefault()}
            className="relative flex-1 w-full bg-slate-950 overflow-hidden"
          >
            {activeNote.pdfUrl ? (
              <iframe
                src={`${activeNote.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                title={activeNote.title}
                className="w-full h-full border-0 bg-slate-950 pointer-events-auto"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Notes not uploaded for this episode
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
