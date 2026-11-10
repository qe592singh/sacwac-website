"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import YoutubeIcon from "@/components/YoutubeIcon";
import DocumentViewerModal from "@/components/DocumentViewerModal";
import { Video, Playlist, NoteDoc } from "@/types";
import { getYoutubeEmbedUrl } from "@/lib/youtube";
import {
  Play,
  Clock,
  Share2,
  Check,
  ExternalLink,
  Layers,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ListVideo,
  FileText
} from "lucide-react";

interface EnrichedPlaylist extends Playlist {
  videos: Video[];
}

function WatchContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = params?.id as string;
  const listParam = searchParams.get("list");

  const [videos, setVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<EnrichedPlaylist[]>([]);
  const [notes, setNotes] = useState<NoteDoc[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [activePlaylist, setActivePlaylist] = useState<EnrichedPlaylist | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteDoc | null>(null);
  const [notesNotice, setNotesNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/videos").then((r) => r.json()),
      fetch("/api/playlists").then((r) => r.json()),
      fetch("/api/notes").then((r) => r.json()),
    ])
      .then(([vData, pData, nData]) => {
        let allVids: Video[] = [];
        let allPlaylists: EnrichedPlaylist[] = [];

        if (nData.success && nData.notes) {
          setNotes(nData.notes);
        }

        if (vData.success && vData.videos) {
          allVids = vData.videos;
          setVideos(allVids);

          const found = allVids.find(
            (v: Video) => v.youtubeId === rawId || v.id === rawId || v.id === `vid-${rawId}`
          );
          if (found) {
            setCurrentVideo(found);
          } else if (allVids.length > 0) {
            setCurrentVideo(allVids[0]);
          }
        }

        if (pData.success && pData.playlists) {
          allPlaylists = pData.playlists;
          setPlaylists(allPlaylists);

          if (listParam) {
            const matchedPl = allPlaylists.find((p) => p.id === listParam || p.slug === listParam);
            if (matchedPl) {
              setActivePlaylist(matchedPl);
            }
          }
        }
      })
      .catch((err) => console.error("Error loading watch data:", err))
      .finally(() => setLoading(false));
  }, [rawId, listParam]);

  useEffect(() => {
    if (!currentVideo || playlists.length === 0) return;

    if (listParam) {
      const pl = playlists.find((p) => p.id === listParam || p.slug === listParam);
      if (pl) {
        setActivePlaylist(pl);
        return;
      }
    }

    const defaultPl = playlists.find((p) =>
      p.videoIds.includes(currentVideo.youtubeId)
    );
    setActivePlaylist(defaultPl || null);
  }, [currentVideo, playlists, listParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-slate-500 font-medium">
          Loading SacWac Masterclass...
        </div>
        <Footer />
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <h1 className="text-xl font-bold">Video not found</h1>
          <Link href="/videos" className="text-sky-500 hover:underline">
            Browse Video Library
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  let playlistVideos: Video[] = [];
  let currentPlaylistIndex = -1;

  if (activePlaylist && activePlaylist.videos) {
    playlistVideos = activePlaylist.videos;
    currentPlaylistIndex = playlistVideos.findIndex(
      (v) => v.youtubeId === currentVideo.youtubeId
    );
  }

  const excludeIds = new Set([
    currentVideo.youtubeId,
    ...playlistVideos.map((v) => v.youtubeId),
  ]);
  const relatedVideos = videos.filter((v) => !excludeIds.has(v.youtubeId)).slice(0, 8);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const prevVideo =
    currentPlaylistIndex > 0 ? playlistVideos[currentPlaylistIndex - 1] : null;
  const nextVideo =
    currentPlaylistIndex >= 0 && currentPlaylistIndex < playlistVideos.length - 1
      ? playlistVideos[currentPlaylistIndex + 1]
      : null;

  const currentNote = currentVideo
    ? notes.find((n) => {
        if (currentVideo.noteId && n.id === currentVideo.noteId) return true;
        if (n.videoId && n.videoId === currentVideo.id) return true;
        if (
          currentVideo.hasNotes &&
          typeof currentVideo.episode === "number" &&
          n.episode === currentVideo.episode &&
          n.category === currentVideo.category
        ) {
          return true;
        }
        return false;
      })
    : null;

  const handleOpenNotes = () => {
    if (currentNote) {
      setSelectedNote(currentNote);
    } else {
      setNotesNotice("Study notes are currently being prepared for this video. Check back soon!");
      setTimeout(() => setNotesNotice(null), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ================= LEFT MAIN COLUMN: 16:9 VIDEO PLAYER & DETAILS ================= */}
          <div className="lg:col-span-8 space-y-4">
            {/* 16:9 Video Canvas Frame */}
            <div className="relative w-full pt-[56.25%] bg-black rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
              <iframe
                src={getYoutubeEmbedUrl(currentVideo.youtubeId)}
                title={currentVideo.title}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Video Title */}
            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
              {currentVideo.title}
            </h1>

            {/* Action Bar (Playlist Nav, Share & Subscribe) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {currentVideo.episode && (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    Episode {currentVideo.episode}
                  </span>
                )}
                <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {currentVideo.category}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {currentVideo.duration}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Playlist Next/Prev Shortcuts */}
                {activePlaylist && (
                  <div className="flex items-center gap-1.5 mr-2">
                    {prevVideo ? (
                      <Link
                        href={`/watch/${prevVideo.youtubeId}?list=${activePlaylist.id}`}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors"
                        title="Previous Lesson"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev
                      </Link>
                    ) : null}

                    {nextVideo ? (
                      <Link
                        href={`/watch/${nextVideo.youtubeId}?list=${activePlaylist.id}`}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-sm flex items-center gap-1 transition-all hover:scale-105 active:scale-95"
                        title="Next Lesson"
                      >
                        Next Lesson <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : null}
                  </div>
                )}

                {/* Notes Button (Only shown if video has attached study notes) */}
                {currentNote && (
                  <button
                    onClick={handleOpenNotes}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                    title="Read Lesson Study Notes"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Notes</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 dark:bg-emerald-300 animate-pulse" />
                  </button>
                )}

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </>
                  )}
                </button>

                {/* YouTube Link */}
                <a
                  href={currentVideo.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <YoutubeIcon className="w-3.5 h-3.5" /> YouTube
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            </div>

            {/* Optional Notes Notice Toast */}
            {notesNotice && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2 animate-in fade-in">
                <span>{notesNotice}</span>
              </div>
            )}

            {/* Description Box with full formatting preserved */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-bold">
                  {currentVideo.category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" /> {currentVideo.duration}
                </span>
                {activePlaylist && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> Course: {activePlaylist.title}
                    </span>
                  </>
                )}
              </div>

              <div
                className={`text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line ${
                  descriptionExpanded ? "" : "line-clamp-4"
                }`}
              >
                {currentVideo.description}
              </div>

              <button
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 pt-1"
              >
                {descriptionExpanded ? "Show Less" : "Show Full Description"}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    descriptionExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: YOUTUBE PLAYLIST & RELATED QUEUE ================= */}
          <div className="lg:col-span-4 space-y-5">
            {/* 1. PLAYLIST QUEUE WIDGET (When watching from a Playlist) */}
            {activePlaylist && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm h-fit">
                {/* Playlist Header */}
                <div className="p-4 bg-slate-100/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1">
                      <ListVideo className="w-3.5 h-3.5" /> Course Playlist
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                      {currentPlaylistIndex >= 0 ? `${currentPlaylistIndex + 1} / ` : ""}
                      {playlistVideos.length} videos
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {activePlaylist.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    SacWac • Sachin Singh
                  </p>
                </div>

                {/* Playlist Video Items with THUMBNAILS */}
                <div className="max-h-[500px] overflow-y-auto p-2 space-y-1.5">
                  {playlistVideos.map((plVid, idx) => {
                    const isPlaying = plVid.youtubeId === currentVideo.youtubeId;
                    return (
                      <Link
                        key={plVid.id}
                        href={`/watch/${plVid.youtubeId}?list=${activePlaylist.id}`}
                        className={`group p-2 rounded-xl transition-all flex items-center gap-3 border ${
                          isPlaying
                            ? "bg-sky-500/10 border-sky-500/50 dark:bg-sky-500/20 shadow-sm"
                            : "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                        }`}
                      >
                        {/* Playing / Index Indicator */}
                        <div className="w-5 text-center text-xs font-bold text-slate-400 shrink-0">
                          {isPlaying ? (
                            <Play className="w-3.5 h-3.5 fill-sky-500 text-sky-500 mx-auto" />
                          ) : (
                            idx + 1
                          )}
                        </div>

                        {/* Video Thumbnail */}
                        <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-200 dark:border-slate-800">
                          <img
                            src={plVid.thumbnailUrl}
                            alt={plVid.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 text-[9px] font-mono bg-black/80 text-white rounded">
                            {plVid.duration}
                          </span>
                        </div>

                        {/* Video Info */}
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h4
                            className={`text-xs font-semibold line-clamp-2 leading-snug ${
                              isPlaying
                                ? "text-sky-600 dark:text-sky-400 font-bold"
                                : "text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400"
                            }`}
                          >
                            {plVid.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Lesson #{idx + 1}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. RELATED VIDEOS WITH FULL THUMBNAILS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Related SacWac Lessons
                </h3>
                <Link
                  href="/videos"
                  className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {relatedVideos.map((relVid) => (
                  <Link
                    key={relVid.id}
                    href={`/watch/${relVid.youtubeId}`}
                    className="group p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 transition-all duration-200 flex items-start gap-3 shadow-sm hover:shadow-md cursor-pointer"
                  >
                    {/* Thumbnail with duration badge & play on hover */}
                    <div className="relative w-32 sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-200 dark:border-slate-800">
                      <img
                        src={relVid.thumbnailUrl}
                        alt={relVid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] font-mono bg-black/85 text-white rounded">
                        {relVid.duration}
                      </span>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <Play className="w-5 h-5 fill-white text-white" />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                        {relVid.category}
                      </span>

                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
                        {relVid.title}
                      </h4>

                      <span className="text-[10px] text-slate-400 block">
                        SacWac • Sachin Singh
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Explore Link */}
            <div className="pt-2 text-center">
              <Link
                href="/videos"
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
              >
                Browse All Lessons & Courses <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <DocumentViewerModal
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
      />

      <Footer />
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500">
          Loading SacWac Player...
        </div>
      }
    >
      <WatchContent />
    </Suspense>
  );
}
