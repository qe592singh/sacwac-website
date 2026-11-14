"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import YoutubeIcon from "@/components/YoutubeIcon";
import { Video, Playlist } from "@/types";
import { Search, Play, Clock, ArrowRight, ExternalLink, Layers } from "lucide-react";
import { getVideoTimestamp } from "@/lib/formatters";

interface EnrichedPlaylist extends Playlist {
  videos: Video[];
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<EnrichedPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "oldest">("latest");
  const [viewMode, setViewMode] = useState<"videos" | "playlists">("playlists");

  useEffect(() => {
    Promise.all([
      fetch("/api/videos").then((r) => r.json()),
      fetch("/api/playlists").then((r) => r.json()),
    ])
      .then(([vData, pData]) => {
        if (vData.success && vData.videos) setVideos(vData.videos);
        if (pData.success && pData.playlists) setPlaylists(pData.playlists);
      })
      .catch((err) => console.error("Error loading videos:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredVideos = videos.filter((v) => {
    const matchesCat = category === "All" || v.category === category;
    const matchesSearch =
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase()) ||
      (v.tags && v.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortBy === "latest") {
      const dateA = getVideoTimestamp(a);
      const dateB = getVideoTimestamp(b);
      return dateB - dateA;
    }
    if (sortBy === "oldest") {
      const dateA = getVideoTimestamp(a);
      const dateB = getVideoTimestamp(b);
      return dateA - dateB;
    }
    if (sortBy === "popular") {
      const viewsA = a.views ?? 0;
      const viewsB = b.views ?? 0;
      return viewsB - viewsA;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-8 w-full">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
            <YoutubeIcon className="w-3.5 h-3.5" /> SacWac Video Masterclasses
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Complete Video Library & Courses
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            All {videos.length > 0 ? videos.length : "40+"} lessons organized in chronological sequence. Learn from structured playlists or explore individual lessons by topic.
          </p>
        </div>

        {/* View Switcher: Individual Lessons vs Playlists */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setViewMode("videos")}
            className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition-all ${
              viewMode === "videos"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Play className="w-4 h-4" />
            All Lessons ({videos.length})
          </button>

          <button
            onClick={() => setViewMode("playlists")}
            className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition-all ${
              viewMode === "playlists"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            Structured Playlists ({playlists.length})
          </button>
        </div>

        {/* ================= VIEW: STRUCTURED PLAYLISTS ================= */}
        {viewMode === "playlists" && (
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {playlists.map((pl) => {
                const firstVid = pl.videoIds && pl.videoIds.length > 0 ? pl.videoIds[0] : "zuc9mfc0S6M";
                return (
                  <Link
                    key={pl.id}
                    href={`/watch/${firstVid}?list=${pl.id}`}
                    className="group relative bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-sky-500/15 cursor-pointer flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                        <img
                          src={pl.thumbnail}
                          alt={pl.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                        <div className="absolute top-3 right-3 px-3 py-1 bg-black/85 backdrop-blur-md rounded-xl text-xs font-semibold text-white border border-white/20 flex items-center gap-1.5 shadow-lg">
                          <Layers className="w-3.5 h-3.5 text-sky-400" />
                          {pl.totalEpisodes} Episodes
                        </div>

                        <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[11px] font-semibold backdrop-blur-md">
                          {pl.category}
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
                          <div className="w-14 h-14 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-xl shadow-sky-500/40 transform group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 fill-white ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-medium text-sky-600 dark:text-sky-400">{pl.level}</span>
                          <span>Complete Course</span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                          {pl.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                          {pl.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400">
                        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Start Course On Watch Page <ArrowRight className="w-4 h-4" />
                        </span>
                        <span className="text-[11px] font-normal text-slate-400">
                          {pl.totalEpisodes} Lessons
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= VIEW: ALL INDIVIDUAL LESSONS ================= */}
        {viewMode === "videos" && (
          <div className="space-y-6">
            {/* Search & Filters Bar */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search all lessons by topic, title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-sm"
                  />
                </div>

                {/* YouTube-style Sort Tabs: Latest, Popular, Oldest */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full sm:w-auto justify-center">
                  <button
                    onClick={() => setSortBy("latest")}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      sortBy === "latest"
                        ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Latest
                  </button>
                  <button
                    onClick={() => setSortBy("popular")}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      sortBy === "popular"
                        ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Popular
                  </button>
                  <button
                    onClick={() => setSortBy("oldest")}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      sortBy === "oldest"
                        ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Oldest
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {["All", "Admin", "Flows", "Security", "Apex", "Integration"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                      category === cat
                        ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <span className="text-xs text-slate-400 font-mono ml-auto">
                  Showing {sortedVideos.length} lessons
                </span>
              </div>
            </div>

            {/* Video Grid */}
            {loading ? (
              <div className="py-24 text-center text-slate-500">Loading lessons...</div>
            ) : sortedVideos.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <YoutubeIcon className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">No lessons found matching your search.</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                  className="text-xs text-sky-500 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedVideos.map((vid) => (
                  <Link
                    key={vid.id}
                    href={`/watch/${vid.youtubeId}`}
                    className="group relative bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 cursor-pointer flex flex-col justify-between shadow-sm"
                  >
                    <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                      <img
                        src={vid.thumbnailUrl}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                        <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 transform group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>

                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 text-[11px] font-mono font-medium bg-black/80 text-white rounded backdrop-blur-md flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {vid.duration}
                      </span>

                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[11px] font-semibold bg-black/80 text-sky-400 border border-sky-400/30 rounded backdrop-blur-md">
                        {vid.category}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        {/* YouTube-style metadata: views and upload date */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          <span className="text-sky-600 dark:text-sky-400 font-semibold">
                            {vid.viewsText || "1.2K views"}
                          </span>
                          <span>•</span>
                          <span>{vid.date}</span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
                          {vid.title}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {vid.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono text-[11px]">{vid.duration}</span>
                        <span className="text-sky-600 dark:text-sky-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Watch Video <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* YouTube Channel Banner */}
        <div className="mt-12 p-8 rounded-3xl bg-red-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold">Subscribe to SacWac on YouTube</h3>
            <p className="text-xs sm:text-sm text-red-100 max-w-xl">
              Get direct alerts when new Salesforce tutorial series, interview scenarios, and architecture deep-dives go live!
            </p>
          </div>
          <a
            href="https://www.youtube.com/@SachinSingh-n2g7t"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-white text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl shadow-md flex items-center gap-2 whitespace-nowrap active:scale-95 transition-all"
          >
            <YoutubeIcon className="w-4 h-4" />
            Visit @SachinSingh-n2g7t
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
