"use client";

import React, { useState, useEffect } from "react";
import { NoteDoc } from "@/types";
import {
  X,
  Share2,
  Check,
  Maximize2,
  Minimize2,
  FileText,
  AlertTriangle
} from "lucide-react";

interface DocumentViewerModalProps {
  note: NoteDoc | null;
  onClose: () => void;
}

export default function DocumentViewerModal({
  note,
  onClose,
}: DocumentViewerModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      // Anti-download, anti-print, anti-copy shortcuts
      if (
        (e.ctrlKey || e.metaKey) &&
        ["p", "P", "s", "S", "c", "C", "u", "U"].includes(e.key)
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!note) return null;

  const handleShareLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/notes?note=${note.id}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div
        className={`relative w-full ${
          isFullscreen ? "max-w-none h-full rounded-none" : "max-w-6xl h-[94vh] rounded-2xl"
        } bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden transition-all`}
      >
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {note.episode !== undefined && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-md">
                    Episode {note.episode}
                  </span>
                )}
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                  {note.category} Study Guide
                </span>
                <span className="text-xs text-slate-400 hidden md:inline">
                  • Protected Document
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-lg md:max-w-xl">
                {note.title}
              </h2>
            </div>
          </div>

          {/* Viewer Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Share Reader Link */}
            <button
              onClick={handleShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-300 bg-sky-950/60 hover:bg-sky-900/60 border border-sky-500/30 rounded-lg transition-colors"
              title="Copy share link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? "Copied!" : "Share"}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors hidden md:block"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Viewer"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Protected PDF Viewer Canvas */}
        <div className="relative flex-1 w-full h-full bg-slate-950 overflow-hidden flex flex-col">
          {note.pdfUrl ? (
            <iframe
              src={`${note.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full flex-1 border-0 bg-slate-950 pointer-events-auto"
              title={note.title}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 text-slate-400">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <h3 className="text-base font-bold text-white mb-1">
                  Notes Not Uploaded for this Episode
                </h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Notes not uploaded for this episode
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
