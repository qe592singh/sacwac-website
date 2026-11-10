"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DocumentViewerModal from "@/components/DocumentViewerModal";
import YoutubeIcon from "@/components/YoutubeIcon";
import { Video, NoteDoc, Playlist } from "@/types";
import {
  Play,
  BookOpen,
  ArrowRight,
  Clock,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  FileText,
  Layers,
  GraduationCap
} from "lucide-react";

interface EnrichedPlaylist extends Playlist {
  videos: Video[];
}

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<EnrichedPlaylist[]>([]);
  const [notes, setNotes] = useState<NoteDoc[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteDoc | null>(null);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    fetch("/api/videos")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.videos) {
          setVideos(data.videos);
        }
      })
      .catch((err) => console.error("Error loading videos:", err));

    fetch("/api/playlists")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.playlists) {
          setPlaylists(data.playlists);
        }
      })
      .catch((err) => console.error("Error loading playlists:", err));

    fetch("/api/notes")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.notes) {
          setNotes(data.notes.slice(0, 3));
        }
      })
      .catch((err) => console.error("Error loading notes:", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        {/* ================= HERO SECTION (Optimized for above-the-fold full visibility) ================= */}
        <section className="relative pt-4 pb-8 md:pt-6 md:pb-12 overflow-hidden glow-mesh">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto space-y-3.5 sm:space-y-4">
              {/* Official Blue Brand Emblem */}
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full blur-md opacity-60 group-hover:opacity-90 transition-all duration-300" />
                  <img
                    src="/images/sacwac-blue-badge.png"
                    alt="SacWac Official Emblem"
                    className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full object-contain shadow-lg border-2 border-sky-400/50 hover:scale-105 transition-transform duration-300 bg-slate-950"
                  />
                </div>
              </div>

              {/* Badge Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
                <span className="flex h-1.5 w-1.5 rounded-full bg-sky-500 animate-ping" />
                <span className="font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[10px] sm:text-[11px]">
                  Official SacWac Learning Platform
                </span>
                <span className="text-slate-400 dark:text-slate-600">|</span>
                <span className="text-sky-600 dark:text-sky-400 font-medium text-[10px] sm:text-[11px]">
                  By Sachin Singh
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Master Salesforce with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-500 to-cyan-500 dark:from-sky-400 dark:via-blue-300 dark:to-cyan-300">
                  SacWac.
                </span>
              </h1>

              {/* Broad Subtitle representing the entire SacWac channel */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                The premier educational destination for Salesforce professionals and aspirants. Demystifying Salesforce technology through clear, hands-on tutorials, scenario problem solving, and enterprise architecture concepts.
              </p>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#playlists"
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-xl shadow-md shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  Explore Playlists &amp; Courses
                </a>

                <Link
                  href="/videos"
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-slate-700 dark:fill-slate-200" />
                  Video Library ({videos.length})
                </Link>

                <Link
                  href="/notes"
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-sky-500" />
                  Protected Study Notes
                </Link>
              </div>

              {/* Channel Highlights Stats (Those 4 rectangles) */}
              <div className="pt-3 sm:pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm interactive-card">
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {videos.length > 0 ? `${videos.length}+` : "40+"}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    Structured Videos
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm interactive-card">
                  <div className="text-xl sm:text-2xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">
                    {playlists.length > 0 ? playlists.length : 3}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    Complete Playlists
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm interactive-card">
                  <div className="text-xl sm:text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
                    100%
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    Sequential Learning
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm interactive-card">
                  <div className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                    Free
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    Knowledge Hub
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= STRUCTURED PLAYLISTS & COURSES SECTION ================= */}
        <section id="playlists" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold">
                <GraduationCap className="w-3.5 h-3.5" /> Structured Playlists & Courses
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Curated Step-by-Step Learning Paths
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl">
                Open any playlist to start learning sequentially from Episode 1. Each course has all lessons organized in the optimal learning order.
              </p>
            </div>

            <a
              href="https://www.youtube.com/@SachinSingh-n2g7t/playlists"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-500/30 rounded-xl transition-colors whitespace-nowrap"
            >
              <YoutubeIcon className="w-4 h-4" />
              YouTube Playlists
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>

          {/* Playlist Cards Grid */}
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
                    {/* Playlist Banner with Stacked Badge */}
                    <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                      <img
                        src={pl.thumbnail}
                        alt={pl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                      {/* Sequential Episode Badge */}
                      <div className="absolute top-3 right-3 px-3 py-1 bg-black/85 backdrop-blur-md rounded-xl text-xs font-semibold text-white border border-white/20 flex items-center gap-1.5 shadow-lg">
                        <Layers className="w-3.5 h-3.5 text-sky-400" />
                        {pl.totalEpisodes} Episodes
                      </div>

                      <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[11px] font-semibold backdrop-blur-md">
                        {pl.category}
                      </div>

                      {/* Big Center Play Icon on Hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
                        <div className="w-14 h-14 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-xl shadow-sky-500/40 transform group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-sky-600 dark:text-sky-400">{pl.level}</span>
                        <span>Sequential Course</span>
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
                        Start Course on Watch Page <ArrowRight className="w-4 h-4" />
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
        </section>

        {/* ================= SEQUENCED VIDEO LIBRARY PREVIEW ================= */}
        <section className="py-16 md:py-24 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                  <YoutubeIcon className="w-3.5 h-3.5" /> All Videos in Sequence
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Sequential Lessons by Episode
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                  All {videos.length > 0 ? videos.length : "40+"} masterclasses organized chronologically. Click any card to watch directly.
                </p>
              </div>

              <Link
                href="/videos"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-500/30 rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors shrink-0"
              >
                View Full Video Library ({videos.length}) <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.slice(0, 9).map((vid, idx) => (
                <Link
                  key={vid.id}
                  href={`/watch/${vid.youtubeId}`}
                  className="group relative bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 cursor-pointer flex flex-col justify-between shadow-sm"
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
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-sky-600 dark:text-sky-400 font-semibold">
                          Lesson #{idx + 1}
                        </span>
                        <span className="text-slate-400">
                          {vid.viewsText || "1.2K views"} • {vid.date}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
                        {vid.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {vid.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">{vid.duration}</span>
                      <span className="text-sky-600 dark:text-sky-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Watch Lesson <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ================= PROTECTED STUDY NOTES SHOWCASE ================= */}
        <section className="py-16 md:py-24 border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Architecture Notes
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Protected Online Knowledge Base
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                  High-yield study guides created by Sachin Singh, accessible in our download-protected viewer.
                </p>
              </div>

              <Link
                href="/notes"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-500/30 rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
              >
                Explore All Notes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 cursor-pointer flex flex-col justify-between group shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                        {note.badge || note.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {note.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                      {note.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {note.summary}
                    </p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {note.sections.length} Core Sections
                    </span>
                    <span className="text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read Online <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FAQ ACCORDION ================= */}
        <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Common questions about SacWac tutorials, notes, and the learning experience.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "What makes SacWac different from standard Salesforce tutorials?",
                a: "SacWac focuses heavily on practical, scenario-driven explanations rather than basic click-by-click theory. Sachin Singh walks through the 'why' behind architectural choices, edge cases, bulkification, and common enterprise interview scenarios.",
              },
              {
                q: "Why are study notes viewable online rather than downloaded as PDFs?",
                a: "Salesforce introduces 3 major platform releases every year (Spring, Summer, Winter). Keeping notes live inside the SacWac online viewer guarantees you always access the most current, verified information with correct formulas and syntax.",
              },
              {
                q: "How are the playlists organized?",
                a: "The playlists are organized strictly by episode sequence (Lesson 1, Lesson 2, Lesson 3...). When you open any course, you can play through all lessons seamlessly without searching for the next episode.",
              },
              {
                q: "Is SacWac suitable for both Beginners and Experienced Developers?",
                a: "Absolutely. Content is tagged from Beginner to Advanced, ranging from fundamental admin validation rules all the way to advanced Apex Collections and enterprise security models.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
      />
    </div>
  );
}
