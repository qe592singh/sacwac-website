"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Users,
  Search,
  Coffee,
  Sparkles,
  Calendar,
  X,
} from "lucide-react";

interface Supporter {
  _id: string;
  name: string;
  message?: string;
  amount: number;
  createdAt: string;
}

export default function SupportersPage() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetch("/api/donations")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.donations)) {
          setSupporters(data.donations);
        }
      })
      .catch((err) => console.error("Error fetching supporters:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalAmount = useMemo(() => {
    return supporters.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [supporters]);

  const filteredSupporters = useMemo(() => {
    if (!searchQuery.trim()) return supporters;
    const q = searchQuery.toLowerCase();
    return supporters.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.message && s.message.toLowerCase().includes(q))
    );
  }, [supporters, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8 sm:space-y-10">
        {/* ================= HERO HEADER ================= */}
        <section className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold shadow-sm">
            <Users className="w-4 h-4" />
            SacWac Hall of Fame
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            People Who Chose to <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">Support</span> 🌟
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Every contribution directly fuels more free, in-depth Salesforce tutorials, architecture breakdowns, and downloadable study guides for the global developer community.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/support"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-md shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Coffee className="w-4 h-4" />
              Buy Me a Coffee ☕
            </Link>
          </div>
        </section>

        {/* ================= STATS SUMMARY CARDS ================= */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">
              {supporters.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Generous Supporters
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              ₹{totalAmount.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Total Community Fuel
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm text-center flex flex-col justify-center">
            <div className="text-xl sm:text-2xl font-black text-amber-500 font-mono flex items-center justify-center gap-1">
              100%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Free Public Content
            </div>
          </div>
        </section>

        {/* ================= SEARCH & SUPPORTERS LIST ================= */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-500" />
                Community Supporters ({filteredSupporters.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sorted by most recent contributions.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by supporter name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Supporters Grid / List */}
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400 animate-pulse">
              Loading supporter community...
            </div>
          ) : filteredSupporters.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                <Coffee className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {searchQuery ? "No supporter found matching your search" : "No public supporters yet"}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? "Try checking your spelling or clear the search field."
                  : "Be the first to buy Sachin a coffee and have your name featured here!"}
              </p>
              {!searchQuery && (
                <Link
                  href="/support"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 rounded-xl border border-sky-500/20"
                >
                  Be First Supporter →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredSupporters.map((supporter, idx) => {
                const initial = (supporter.name || "A").trim().charAt(0).toUpperCase();
                const colors = [
                  "from-sky-500 to-indigo-600",
                  "from-emerald-500 to-teal-600",
                  "from-purple-500 to-pink-600",
                  "from-amber-500 to-orange-600",
                ];
                const grad = colors[idx % colors.length];

                return (
                  <article
                    key={supporter._id}
                    className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl flex items-start gap-3.5 hover:border-sky-500/30 transition-all shadow-sm"
                  >
                    {/* Supporter Avatar Badge */}
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} text-white font-extrabold flex items-center justify-center text-sm shadow-md shrink-0`}
                    >
                      {initial}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {supporter.name}
                        </h4>
                        <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                          ₹{Number(supporter.amount).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {supporter.message || "Sent warm support for the SacWac tutorials! ☕"}
                      </p>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono pt-0.5">
                        <Calendar className="w-3 h-3 opacity-60" />
                        <span>
                          {new Date(supporter.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
