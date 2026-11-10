"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import YoutubeIcon from "@/components/YoutubeIcon";
import LinkedinIcon from "@/components/LinkedinIcon";
import Logo from "@/components/Logo";
import { ExternalLink, CheckCircle2, Sparkles, Target, Mail } from "lucide-react";

interface Profile {
  name: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  topmateUrl?: string;
  email?: string;
  workEmail?: string;
}

export default function AboutPage() {
  const [profile, setProfile] = useState<Profile>({
    name: "Sachin Singh",
    title: "Salesforce Specialist & Content Creator at SacWac",
    bio: "Salesforce specialist, educator, and content creator dedicated to breaking down complex Salesforce architecture, Flows, and enterprise administration into practical, scenario-based learning for trailblazers worldwide.",
    avatarUrl: "",
    youtubeUrl: "https://www.youtube.com/@SachinSingh-n2g7t",
    linkedinUrl: "https://www.linkedin.com/in/sachin-singh-040290218/",
    topmateUrl: "https://topmate.io/sacwac",
    email: "sacwacsalesforce@gmail.com",
    workEmail: "sacwac.work@gmail.com",
  });

  useEffect(() => {
    fetch("/api/admin/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.profile && data.profile.name) {
          setProfile(data.profile);
        }
      })
      .catch((err) => console.error("Error loading profile:", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> About SacWac
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Simplifying Salesforce for Everyone
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Welcome to the official digital hub for the <strong>SacWac</strong> educational platform and YouTube channel.
          </p>
        </div>

        {/* Dynamic Creator Profile Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar or Fallback Logo (Enlarged Portrait Layout) */}
          <div className="shrink-0 relative group">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-48 h-64 sm:w-56 sm:h-72 lg:w-64 lg:h-80 rounded-2xl sm:rounded-3xl object-cover border-2 border-sky-400 dark:border-sky-500 shadow-xl shadow-sky-500/20 group-hover:scale-[1.02] transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-48 h-64 sm:w-56 sm:h-72 lg:w-64 lg:h-80 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-1 flex items-center justify-center shadow-xl shadow-sky-500/20">
                <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] sm:rounded-[22px] flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <Logo size="lg" showText={false} />
                  <span className="text-sm font-black text-slate-900 dark:text-white tracking-wider">
                    SACWAC
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Founder & Educator</span>
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Founder & Lead Educator
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {profile.name}
              </h2>
              <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-400">
                {profile.title}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {profile.bio}
            </p>

            {/* Row 1: External Platform & Community Links */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              {profile.youtubeUrl && (
                <a
                  href={profile.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <YoutubeIcon className="w-3.5 h-3.5" /> YouTube Channel
                </a>
              )}

              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all"
                >
                  <LinkedinIcon className="w-3.5 h-3.5 text-sky-500" /> LinkedIn
                </a>
              )}

              {profile.topmateUrl && (
                <a
                  href={profile.topmateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> 1:1 Mentorship (Topmate)
                </a>
              )}
            </div>

            {/* Row 2: Dedicated Email Contacts Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all"
                  title="Official Channel Email"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-500" /> {profile.email}
                </a>
              )}

              {profile.workEmail && (
                <a
                  href={`mailto:${profile.workEmail}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all"
                  title="Official Work Email"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-500" /> {profile.workEmail}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Channel Mission */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-sky-500" /> The SacWac Vision
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
            Salesforce is one of the most powerful enterprise cloud platforms in the world, but mastering it can be overwhelming. Many learners find themselves stuck between basic Trailhead modules and the complex requirements demanded in real enterprise projects.
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
            <strong>SacWac</strong> was created to demystify Salesforce technology. Through step-by-step video courses and concise study notes, our mission is to empower beginners, system administrators, software engineers, and aspiring architects with deep, practical skills.
          </p>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-sky-600 dark:text-sky-400 font-bold text-lg">Practical First</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Focusing on real business scenarios rather than purely theoretical examples.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">Clean Architecture</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Teaching bulkification, Governor Limits, and scalable design patterns.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-purple-600 dark:text-purple-400 font-bold text-lg">Free Education</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Accessible to trailblazers worldwide on YouTube and our secure reader.
              </p>
            </div>
          </div>
        </div>

        {/* What You Will Learn */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What You Will Find on SacWac</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Salesforce Flow Builder: Record-Triggered, Screen Flows & Autolaunched Flows",
              "Apex Programming: Collections (Lists, Sets, Maps), Trigger Handlers & Best Practices",
              "Salesforce Security: Restriction Rules, Scoping Rules, FLS, and Sharing Architecture",
              "Validation Rules, Complex Formulas, and REGEX Expressions",
              "Real-World Scenario Questions & Developer Interview Preparation",
              "Governor Limits Optimization & Enterprise Problem Solving",
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Connect Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-red-600 to-rose-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold">Join the SacWac YouTube Community</h3>
            <p className="text-xs sm:text-sm text-red-100 max-w-xl">
              Subscribe to Sachin Singh&apos;s channel to stay up to date with new tutorials and release guides.
            </p>
          </div>
          <a
            href="https://www.youtube.com/@SachinSingh-n2g7t"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-white text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl shadow-md flex items-center gap-2 whitespace-nowrap active:scale-95 transition-all"
          >
            <YoutubeIcon className="w-4 h-4" />
            Subscribe @SachinSingh-n2g7t
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
