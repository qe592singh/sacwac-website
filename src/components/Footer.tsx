import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import YoutubeIcon from "./YoutubeIcon";
import LinkedinIcon from "./LinkedinIcon";
import { ExternalLink, Shield, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md leading-relaxed">
              <strong className="text-slate-900 dark:text-white">SacWac</strong> by Sachin Singh is an educational platform dedicated to simplifying Salesforce technology through comprehensive tutorials, practical scenarios, and high-value architecture notes.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <a
                href="https://www.youtube.com/@SachinSingh-n2g7t"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-all shadow-md shadow-red-500/20"
              >
                <YoutubeIcon className="w-3.5 h-3.5" />
                YouTube
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <a
                href="https://www.linkedin.com/in/sachin-singh-040290218/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
              >
                <LinkedinIcon className="w-3.5 h-3.5 text-sky-500" />
                LinkedIn
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <a
                href="https://topmate.io/sacwac"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-xl transition-all shadow-md shadow-orange-500/20"
              >
                Topmate Mentorship
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <a
                href="mailto:sacwacsalesforce@gmail.com"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
                title="sacwacsalesforce@gmail.com"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-500" />
                Email
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/videos" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Video Library
                </Link>
              </li>
              <li>
                <Link href="/notes" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  Study Notes
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                  <span>☕</span> Support Sachin (Buy Coffee)
                </Link>
              </li>
              <li>
                <Link href="/supporters" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Community Supporters
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  About SacWac & Sachin Singh
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Salesforce Topics */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Learning Focus
            </h4>
            <ul className="space-y-2 text-xs">
              <li>Salesforce Administration & Configuration</li>
              <li>Flow Builder Automation & Scenarios</li>
              <li>Apex Development & Trigger Architecture</li>
              <li>Data Security, Sharing & Restriction Rules</li>
              <li>Scenario-Based Technical Interview Prep</li>
              <li>Validation Rules & Best Practices</li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SacWac by Sachin Singh. All educational rights reserved.</p>
          <p className="max-w-xl text-center md:text-right">
            Disclaimer: Salesforce and related marks are registered trademarks of salesforce.com, inc. SacWac is an independent learning community.
          </p>
        </div>
      </div>
    </footer>
  );
}
