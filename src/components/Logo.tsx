import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const iconDimensions = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  }[size];

  const textStyles = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  }[size];

  return (
    <Link href="/" className={`inline-flex items-center gap-3 group transition-transform active:scale-95 ${className}`}>
      {/* Brand Icon Glyph */}
      <div className={`relative ${iconDimensions} flex items-center justify-center shrink-0`}>
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl blur-[6px] opacity-70 group-hover:opacity-100 transition-opacity" />
        
        {/* Core Canvas */}
        <div className="relative w-full h-full bg-white dark:bg-slate-950 border border-sky-400/40 dark:border-sky-400/30 rounded-xl p-1.5 flex items-center justify-center shadow-inner group-hover:border-sky-400/80 transition-colors">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>

            <path
              d="M72 42C72 32.06 63.94 24 54 24C45.34 24 38.12 30.12 36.43 38.3C34.73 37.47 32.81 37 30.78 37C23.72 37 18 42.72 18 49.78C18 56.84 23.72 62.56 30.78 62.56H72C78.63 62.56 84 57.19 84 50.56C84 44.5 78.5 39.5 72 42Z"
              stroke="url(#cloudGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(56, 189, 248, 0.12)"
            />

            <path
              d="M38 50L44 44M38 50L44 56"
              stroke="#0284c7"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="dark:stroke-sky-400"
            />
            <path
              d="M62 50L56 44M62 50L56 56"
              stroke="#6366f1"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="50" r="3.5" fill="#f59e0b" className="animate-pulse" />
          </svg>
        </div>
      </div>

      {showText && (
        <span className={`font-black tracking-wider text-slate-900 dark:text-white ${textStyles}`}>
          SAC<span className="text-sky-500 dark:text-sky-400">WAC</span>
        </span>
      )}
    </Link>
  );
}
