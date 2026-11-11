"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useTheme } from "@/context/ThemeContext";
import { Video, NoteDoc, Playlist } from "@/types";
import { extractYoutubeId, getYoutubeThumbnail } from "@/lib/youtube";
import {
  Lock,
  Video as VideoIcon,
  BookOpen,
  Plus,
  Trash2,
  ExternalLink,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  Layers,
  User,
  GripVertical,
  ArrowUp,
  ArrowDown,
  X,
  Sparkles,
  Save,
  FolderPlus,
  Sun,
  Moon,
  Loader2,
  Search,
  Check,
  Filter,
  UploadCloud,
  FileText,
  Pencil,
  Coffee,
} from "lucide-react";

interface EnrichedPlaylist extends Playlist {
  videos: Video[];
}

interface DonationItem {
  _id: string;
  name: string;
  message?: string;
  amount: number;
  status: "pending" | "published";
  confirmedAt?: string;
  createdAt: string;
}

const VIDEO_CATEGORIES: Video["category"][] = [
  "Admin",
  "Flows",
  "Security",
  "Apex",
  "Integration",
  "Validation Rules",
  "Scenarios",
  "General",
];

export default function AdminPage() {
  const { theme, toggleTheme } = useTheme();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<"videos" | "playlists" | "notes" | "donations" | "profile">("videos");

  // Data lists
  const [videos, setVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<EnrichedPlaylist[]>([]);
  const [notes, setNotes] = useState<NoteDoc[]>([]);
  const [donations, setDonations] = useState<DonationItem[]>([]);

  // Donation tab state
  const [donationFilter, setDonationFilter] = useState<"all" | "published" | "pending">("all");
  const [donationSearchQuery, setDonationSearchQuery] = useState("");
  const [editingDonation, setEditingDonation] = useState<DonationItem | null>(null);
  const [editDonationName, setEditDonationName] = useState("");
  const [editDonationAmount, setEditDonationAmount] = useState("");
  const [editDonationMessage, setEditDonationMessage] = useState("");
  const [editDonationStatus, setEditDonationStatus] = useState<"pending" | "published">("published");
  const [donationMsg, setDonationMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Donation Settings state
  const [donAboutTitle, setDonAboutTitle] = useState("About Sachin Singh");
  const [donAboutText, setDonAboutText] = useState("");
  const [donQrImage, setDonQrImage] = useState("/images/payment-qr.png");
  const [donQuickAmounts, setDonQuickAmounts] = useState("500, 1000, 2500, 5000");
  const [donSettingsSaving, setDonSettingsSaving] = useState(false);
  const [donSettingsMsg, setDonSettingsMsg] = useState<string | null>(null);

  // Video search filter
  const [videoSearchQuery, setVideoSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Drag and drop state
  const [draggedVideoIndex, setDraggedVideoIndex] = useState<number | null>(null);
  const [dragOverVideoIndex, setDragOverVideoIndex] = useState<number | null>(null);
  const [draggedPlIndex, setDraggedPlIndex] = useState<number | null>(null);
  const [dragOverPlIndex, setDragOverPlIndex] = useState<number | null>(null);
  const [selectedPlaylistForReorder, setSelectedPlaylistForReorder] = useState<string>("");

  // Add Video Modal State
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [extractedVidId, setExtractedVidId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoCategory, setVideoCategory] = useState<Video["category"]>("Flows");
  const [videoDuration, setVideoDuration] = useState("20:00");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoEpisode, setVideoEpisode] = useState<string>("");
  const [videoNotesPdfUrl, setVideoNotesPdfUrl] = useState("");
  const [videoUploadingNotes, setVideoUploadingNotes] = useState(false);
  const [targetPlaylistId, setTargetPlaylistId] = useState<string>("");
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [videoSubmitting, setVideoSubmitting] = useState(false);
  const [videoModalMsg, setVideoModalMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit Video Modal State
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<Video["category"]>("Admin");
  const [editDuration, setEditDuration] = useState("");
  const [editEpisode, setEditEpisode] = useState("");
  const [editDifficulty, setEditDifficulty] = useState<Video["difficulty"]>("Intermediate");
  const [editNotesPdfUrl, setEditNotesPdfUrl] = useState("");
  const [editUploadingNotes, setEditUploadingNotes] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editMsg, setEditMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Inline "Create New Playlist" inside Video Modal
  const [showInlineNewPlaylist, setShowInlineNewPlaylist] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
  const newPlaylistCategory: Playlist["category"] = "Flows";

  // Create Playlist Form State (under Playlists tab)
  const [plTitle, setPlTitle] = useState("");
  const [plDescription, setPlDescription] = useState("");
  const [plCategory, setPlCategory] = useState<Playlist["category"]>("Flows");
  const plLevel = "Beginner to Advanced";
  const [plSubmitting, setPlSubmitting] = useState(false);

  // Note Form state (PDF Focused)
  const [noteTitle, setNoteTitle] = useState("");
  const [noteCategory, setNoteCategory] = useState<NoteDoc["category"]>("Admin");
  const [noteEpisode, setNoteEpisode] = useState("");
  const [noteSummary, setNoteSummary] = useState("");
  const [noteReadTime, setNoteReadTime] = useState("15 min read");
  const [noteBadge, setNoteBadge] = useState("Official Study Guide");
  const [notePdfUrl, setNotePdfUrl] = useState("");
  const [noteIsFeatured, setNoteIsFeatured] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteMessage, setNoteMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile Form state
  const [profileName, setProfileName] = useState("Sachin Singh");
  const [profileTitle, setProfileTitle] = useState("Salesforce Specialist & Content Creator at SacWac");
  const [profileBio, setProfileBio] = useState("");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState("");
  const [profileYoutube, setProfileYoutube] = useState("https://www.youtube.com/@SachinSingh-n2g7t");
  const [profileLinkedin, setProfileLinkedin] = useState("https://www.linkedin.com/in/sachin-singh-040290218/");
  const [profileTopmate, setProfileTopmate] = useState("https://topmate.io/sacwac");
  const [profileEmail, setProfileEmail] = useState("sacwacsalesforce@gmail.com");
  const [profileWorkEmail, setProfileWorkEmail] = useState("sacwac.work@gmail.com");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Check existing session
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("sacwac_admin_auth");
    if (sessionAuth === "true") {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  // Detect YouTube ID as user types and auto-fetch metadata
  useEffect(() => {
    const id = extractYoutubeId(videoUrl);
    setExtractedVidId(id);
    if (id) {
      // Auto fetch title, duration and description if empty
      handleFetchYoutubeInfo(id);
    }
  }, [videoUrl]);

  const handleFetchYoutubeInfo = async (id: string) => {
    if (!id) return;
    setFetchingDetails(true);
    try {
      const res = await fetch(`/api/youtube-info?id=${id}`);
      const data = await res.json();
      if (data.success) {
        if (data.title) setVideoTitle(data.title);
        if (data.description) setVideoDescription(data.description);
        if (data.duration) setVideoDuration(data.duration);
      }
    } catch (err) {
      console.error("Error auto-fetching info:", err);
    } finally {
      setFetchingDetails(false);
    }
  };

  const fetchData = async () => {
    try {
      const [vRes, pRes, nRes, prRes, donRes, donSetRes] = await Promise.all([
        fetch("/api/videos").then((r) => r.json()),
        fetch("/api/playlists").then((r) => r.json()),
        fetch("/api/notes").then((r) => r.json()),
        fetch("/api/admin/profile").then((r) => r.json()),
        fetch("/api/admin/donations").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/donations/settings").then((r) => r.json()).catch(() => ({ success: false })),
      ]);

      if (vRes.success) setVideos(vRes.videos);
      if (pRes.success) {
        setPlaylists(pRes.playlists);
        if (pRes.playlists.length > 0 && !selectedPlaylistForReorder) {
          setSelectedPlaylistForReorder(pRes.playlists[0].id);
        }
      }
      if (nRes.success) setNotes(nRes.notes);
      if (prRes.success && prRes.profile) {
        setProfileName(prRes.profile.name || "Sachin Singh");
        setProfileTitle(prRes.profile.title || "");
        setProfileBio(prRes.profile.bio || "");
        setProfileAvatarUrl(prRes.profile.avatarUrl || "");
        setProfileYoutube(prRes.profile.youtubeUrl || "");
        setProfileLinkedin(prRes.profile.linkedinUrl || "");
        setProfileTopmate(prRes.profile.topmateUrl || "https://topmate.io/sacwac");
        setProfileEmail(prRes.profile.email || "sacwacsalesforce@gmail.com");
        setProfileWorkEmail(prRes.profile.workEmail || "sacwac.work@gmail.com");
      }
      if (donRes.success && Array.isArray(donRes.donations)) {
        setDonations(donRes.donations);
      }
      if (donSetRes.success && donSetRes.settings) {
        setDonAboutTitle(donSetRes.settings.aboutTitle || "About Sachin Singh");
        setDonAboutText(donSetRes.settings.aboutText || "");
        setDonQrImage(donSetRes.settings.qrImage || "/images/payment-qr.png");
        if (Array.isArray(donSetRes.settings.quickAmounts)) {
          setDonQuickAmounts(donSetRes.settings.quickAmounts.join(", "));
        }
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Incorrect password");
      }

      setIsAuthenticated(true);
      sessionStorage.setItem("sacwac_admin_auth", "true");
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAuthError(err.message);
      } else {
        setAuthError("Failed to authenticate");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("sacwac_admin_auth");
    setPasswordInput("");
  };

  // Add Video
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setVideoModalMsg(null);

    if (!extractedVidId) {
      setVideoModalMsg({ type: "error", text: "Please enter a valid YouTube URL" });
      return;
    }

    if (!videoTitle.trim()) {
      setVideoModalMsg({ type: "error", text: "Please enter a title for the video" });
      return;
    }

    setVideoSubmitting(true);

    try {
      let finalPlaylistId = targetPlaylistId;

      // Handle on-the-spot new playlist creation
      if (showInlineNewPlaylist && newPlaylistTitle.trim()) {
        const plRes = await fetch("/api/playlists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newPlaylistTitle.trim(),
            category: newPlaylistCategory,
            thumbnail: getYoutubeThumbnail(extractedVidId),
          }),
        });
        const plData = await plRes.json();
        if (plData.success) {
          finalPlaylistId = plData.playlist.id;
        }
      }

      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeUrl: videoUrl.trim(),
          youtubeId: extractedVidId,
          title: videoTitle.trim(),
          description: videoDescription.trim() || `Masterclass on ${videoTitle.trim()}`,
          category: videoCategory,
          duration: videoDuration.trim() || "20:00",
          thumbnailUrl: getYoutubeThumbnail(extractedVidId),
          playlistId: finalPlaylistId || undefined,
          episode: videoEpisode.trim() ? Number(videoEpisode) : undefined,
          notesPdfUrl: videoNotesPdfUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add video");
      }

      // If playlist assigned, update playlist's video list
      if (finalPlaylistId) {
        const targetPl = playlists.find((p) => p.id === finalPlaylistId);
        if (targetPl && !targetPl.videoIds.includes(extractedVidId)) {
          const updatedIds = [...targetPl.videoIds, extractedVidId];
          await fetch("/api/playlists", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              playlistId: finalPlaylistId,
              videoIds: updatedIds,
            }),
          });
        }
      }

      setVideoModalMsg({ type: "success", text: "Video & PDF guide linked successfully!" });
      setTimeout(() => {
        setIsAddVideoModalOpen(false);
        setVideoUrl("");
        setVideoTitle("");
        setVideoDescription("");
        setVideoEpisode("");
        setVideoNotesPdfUrl("");
        setTargetPlaylistId("");
        setShowInlineNewPlaylist(false);
        setNewPlaylistTitle("");
        setVideoModalMsg(null);
        fetchData();
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setVideoModalMsg({ type: "error", text: err.message });
      } else {
        setVideoModalMsg({ type: "error", text: "Failed to add video" });
      }
    } finally {
      setVideoSubmitting(false);
    }
  };

  // Helper for uploading Cloudinary PDF for video notes
  const handleUploadPdfForVideo = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isEdit) setEditUploadingNotes(true);
    else setVideoUploadingNotes(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "sacwac_docs");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        if (isEdit) setEditNotesPdfUrl(data.url);
        else setVideoNotesPdfUrl(data.url);
      }
    } catch (err) {
      console.error("PDF upload error:", err);
    } finally {
      if (isEdit) setEditUploadingNotes(false);
      else setVideoUploadingNotes(false);
    }
  };

  // Open Edit Video Modal
  const handleOpenEditVideo = (vid: Video) => {
    setEditingVideo(vid);
    setEditTitle(vid.title);
    setEditCategory(vid.category);
    setEditDuration(vid.duration || "");
    setEditEpisode(vid.episode !== undefined ? String(vid.episode) : "");
    setEditDifficulty(vid.difficulty || "Intermediate");

    const existingNote = notes.find(
      (n) =>
        (vid.noteId && n.id === vid.noteId) ||
        (n.videoId && n.videoId === vid.id) ||
        (vid.hasNotes && typeof vid.episode === "number" && n.episode === vid.episode && n.category === vid.category)
    );
    if (existingNote) {
      setEditNotesPdfUrl(existingNote.pdfUrl || "");
    } else {
      setEditNotesPdfUrl("");
    }
    setEditMsg(null);
  };

  // Save Edit Video Changes
  const handleSaveEditVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    setEditSubmitting(true);
    setEditMsg(null);
    try {
      const res = await fetch("/api/videos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          id: editingVideo.id,
          title: editTitle.trim(),
          category: editCategory,
          duration: editDuration.trim(),
          difficulty: editDifficulty,
          episode: editEpisode.trim() ? Number(editEpisode) : undefined,
          notesPdfUrl: editNotesPdfUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update video");
      }
      setEditMsg({ type: "success", text: "Video details and study notes updated successfully!" });
      setTimeout(() => {
        setEditingVideo(null);
        fetchData();
      }, 900);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update video";
      setEditMsg({ type: "error", text: msg });
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete Video
  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Are you sure you want to remove this video?")) return;

    try {
      const res = await fetch(`/api/videos?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setVideos(videos.filter((v) => v.id !== id));
      }
    } catch (err) {
      console.error("Error deleting video:", err);
    }
  };

  // Reorder single step Up/Down
  const moveVideo = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= videos.length) return;

    const reordered = [...videos];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setVideos(reordered);

    await fetch("/api/videos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videos: reordered }),
    });
  };

  // HTML5 Drag and Drop Handlers with full browser compatibility
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
    setDraggedVideoIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverVideoIndex !== index) {
      setDragOverVideoIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedVideoIndex(null);
    setDragOverVideoIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverVideoIndex(null);

    const sourceIndex = draggedVideoIndex ?? parseInt(e.dataTransfer.getData("text/plain"), 10);
    setDraggedVideoIndex(null);

    if (isNaN(sourceIndex) || sourceIndex === targetIndex) {
      return;
    }

    const reordered = [...videos];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setVideos(reordered);

    await fetch("/api/videos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videos: reordered }),
    });
  };

  // Playlist video drag handlers
  const handlePlDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
    setDraggedPlIndex(index);
  };

  const handlePlDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverPlIndex !== index) {
      setDragOverPlIndex(index);
    }
  };

  const handlePlDragEnd = () => {
    setDraggedPlIndex(null);
    setDragOverPlIndex(null);
  };

  const handlePlDrop = async (e: React.DragEvent, targetIndex: number, playlistId: string) => {
    e.preventDefault();
    setDragOverPlIndex(null);

    const sourceIndex = draggedPlIndex ?? parseInt(e.dataTransfer.getData("text/plain"), 10);
    setDraggedPlIndex(null);

    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    await movePlaylistVideo(playlistId, sourceIndex, targetIndex);
  };

  // Playlist Management
  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plTitle.trim()) return;

    setPlSubmitting(true);
    try {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: plTitle.trim(),
          description: plDescription.trim(),
          category: plCategory,
          level: plLevel,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPlTitle("");
        setPlDescription("");
        fetchData();
      }
    } catch (err) {
      console.error("Error creating playlist:", err);
    } finally {
      setPlSubmitting(false);
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;
    try {
      const res = await fetch(`/api/playlists?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPlaylists(playlists.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Error deleting playlist:", err);
    }
  };

  const movePlaylistVideo = async (plId: string, fromIndex: number, toIndex: number) => {
    const pl = playlists.find((p) => p.id === plId);
    if (!pl || toIndex < 0 || toIndex >= pl.videoIds.length) return;

    const newIds = [...pl.videoIds];
    const [moved] = newIds.splice(fromIndex, 1);
    newIds.splice(toIndex, 0, moved);

    // Update locally
    const updatedPlaylists = playlists.map((p) =>
      p.id === plId ? { ...p, videoIds: newIds, videos: p.videos ? [...p.videos] : [] } : p
    );
    setPlaylists(updatedPlaylists);

    await fetch("/api/playlists", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playlistId: plId, videoIds: newIds }),
    });
    fetchData();
  };

  // Study Notes Handlers (PDF Focused)
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    setNoteMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "sacwac_docs");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }
      setNotePdfUrl(data.url);
      setNoteMessage({ type: "success", text: `PDF "${file.name}" uploaded to Cloudinary successfully!` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cloudinary upload failed";
      setNoteMessage({ type: "error", text: msg });
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      setNoteMessage({ type: "error", text: "Please provide a study guide title" });
      return;
    }
    if (!notePdfUrl.trim()) {
      setNoteMessage({ type: "error", text: "Please upload or provide a Cloudinary PDF document URL" });
      return;
    }

    setNoteSubmitting(true);
    setNoteMessage(null);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noteTitle.trim(),
          category: noteCategory,
          summary: noteSummary.trim() || `Official ${noteCategory} study guide.`,
          readTime: noteReadTime,
          badge: noteBadge,
          episode: noteEpisode.trim() ? Number(noteEpisode) : undefined,
          pdfUrl: notePdfUrl.trim(),
          isFeatured: noteIsFeatured,
          sections: [],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create note");
      }

      setNoteMessage({ type: "success", text: "Episode PDF guide published successfully in MongoDB!" });
      setNoteTitle("");
      setNoteSummary("");
      setNoteEpisode("");
      setNotePdfUrl("");
      setNoteIsFeatured(false);
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setNoteMessage({ type: "error", text: err.message });
      } else {
        setNoteMessage({ type: "error", text: "Failed to create note" });
      }
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this study note?")) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotes(notes.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          title: profileTitle,
          bio: profileBio,
          avatarUrl: profileAvatarUrl,
          youtubeUrl: profileYoutube,
          linkedinUrl: profileLinkedin,
          topmateUrl: profileTopmate,
          email: profileEmail,
          workEmail: profileWorkEmail,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProfileMsg("Profile updated successfully! Live on /about page.");
        setTimeout(() => setProfileMsg(null), 3500);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setProfileMsg("Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  };

  // Donations Handlers
  const handleToggleDonationStatus = async (id: string, currentStatus: "pending" | "published") => {
    const nextStatus = currentStatus === "published" ? "pending" : "published";
    try {
      const res = await fetch(`/api/admin/donations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setDonations((prev) =>
          prev.map((d) => (d._id === id ? { ...d, status: nextStatus } : d))
        );
      }
    } catch (err) {
      console.error("Error toggling donation status:", err);
    }
  };

  const handleOpenEditDonation = (item: DonationItem) => {
    setEditingDonation(item);
    setEditDonationName(item.name);
    setEditDonationAmount(String(item.amount));
    setEditDonationMessage(item.message || "");
    setEditDonationStatus(item.status);
    setDonationMsg(null);
  };

  const handleSaveEditDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDonation) return;

    try {
      const res = await fetch(`/api/admin/donations/${editingDonation._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editDonationName.trim(),
          amount: Number(editDonationAmount),
          message: editDonationMessage.trim(),
          status: editDonationStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update supporter entry");
      }

      setDonations((prev) =>
        prev.map((d) => (d._id === editingDonation._id ? data.donation : d))
      );
      setDonationMsg({ type: "success", text: "Supporter entry updated successfully!" });
      setTimeout(() => {
        setEditingDonation(null);
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update";
      setDonationMsg({ type: "error", text: msg });
    }
  };

  const handleDeleteDonation = async (id: string) => {
    if (!confirm("Are you sure you want to remove this supporter entry?")) return;
    try {
      const res = await fetch(`/api/admin/donations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDonations((prev) => prev.filter((d) => d._id !== id));
      }
    } catch (err) {
      console.error("Error deleting donation:", err);
    }
  };

  const handleSaveDonationSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setDonSettingsSaving(true);
    setDonSettingsMsg(null);

    const parsedQuickAmounts = donQuickAmounts
      .split(",")
      .map((a) => Number(a.trim()))
      .filter((n) => !isNaN(n) && n > 0);

    try {
      const res = await fetch("/api/donations/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aboutTitle: donAboutTitle.trim(),
          aboutText: donAboutText.trim(),
          qrImage: donQrImage.trim(),
          quickAmounts: parsedQuickAmounts,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDonSettingsMsg("Donation settings & QR image updated successfully!");
        setTimeout(() => setDonSettingsMsg(null), 3500);
      }
    } catch (err) {
      console.error("Error saving donation settings:", err);
      setDonSettingsMsg("Failed to save settings");
    } finally {
      setDonSettingsSaving(false);
    }
  };

  // ================= LOGIN SCREEN =================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 transition-colors duration-200">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-500"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-sky-500" />
              Creator Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter administrator passcode to manage videos, playlists, study notes, and creator profile.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Admin Passcode</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter passcode..."
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
            >
              {authLoading ? "Authenticating..." : "Unlock Dashboard"}
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-sky-500 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to SacWac Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ================= MAIN ADMIN DASHBOARD =================
  const activePlaylistData = playlists.find((p) => p.id === selectedPlaylistForReorder);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Logo size="md" />
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            {/* "+ Add YouTube Video" Trigger Button */}
            <button
              onClick={() => setIsAddVideoModalOpen(true)}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 rounded-xl shadow-md shadow-sky-500/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Add YouTube Video</span>
              <span className="sm:hidden">Add Video</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
            >
              View Site <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full space-y-4 sm:space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => setActiveTab("videos")}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 transition-all ${
              activeTab === "videos"
                ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <VideoIcon className="w-4 h-4" />
            All Videos ({videos.length})
          </button>

          <button
            onClick={() => setActiveTab("playlists")}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 transition-all ${
              activeTab === "playlists"
                ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            Playlists & Sequence ({playlists.length})
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 transition-all ${
              activeTab === "notes"
                ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Study Notes ({notes.length})
          </button>

          <button
            onClick={() => setActiveTab("donations")}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 transition-all ${
              activeTab === "donations"
                ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Coffee className="w-4 h-4 text-amber-500" />
            Supporters & Donations ({donations.length})
            {donations.filter((d) => d.status === "pending").length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" title="Pending entries awaiting approval" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 transition-all ${
              activeTab === "profile"
                ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            Creator Profile
          </button>
        </div>

        {/* ================= TAB 1: ALL VIDEOS (FULL WIDTH TABLE WITH DRAG & DROP & CATEGORY SELECTOR) ================= */}
        {activeTab === "videos" && (() => {
          const filteredVideos = videos.filter((vid) => {
            const matchesSearch =
              !videoSearchQuery.trim() ||
              vid.title.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
              vid.id.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
              vid.youtubeId.toLowerCase().includes(videoSearchQuery.toLowerCase());
            const matchesCategory =
              selectedCategoryFilter === "all" || vid.category === selectedCategoryFilter;
            return matchesSearch && matchesCategory;
          });

          return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <VideoIcon className="w-4 h-4 text-sky-500" />
                    All Videos Sequence ({videos.length})
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Update any video category instantly anytime from the dropdown, or drag &amp; drop rows to rearrange sequence.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAddVideoModalOpen(true)}
                    className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Video
                  </button>
                  <div className="text-xs text-slate-500 font-mono hidden sm:block">
                    Changes persist automatically
                  </div>
                </div>
              </div>

              {/* Quick Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1 pb-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search video by title or ID..."
                    value={videoSearchQuery}
                    onChange={(e) => setVideoSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  />
                  {videoSearchQuery && (
                    <button
                      onClick={() => setVideoSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="all">All Categories ({videos.length})</option>
                    {VIDEO_CATEGORIES.map((cat) => {
                      const count = videos.filter((v) => v.category === cat).length;
                      return (
                        <option key={cat} value={cat}>
                          {cat} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="space-y-2.5 sm:space-y-2">
                {filteredVideos.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No videos found matching your filter or search criteria.
                  </div>
                ) : (
                  filteredVideos.map((vid) => {
                    const actualIndex = videos.findIndex((v) => v.id === vid.id);
                    const isDragging = draggedVideoIndex === actualIndex;
                    const isOver = dragOverVideoIndex === actualIndex;
                    const isDragAllowed = !videoSearchQuery && selectedCategoryFilter === "all";

                    return (
                      <div
                        key={vid.id}
                        draggable={isDragAllowed}
                        onDragStart={(e) => handleDragStart(e, actualIndex)}
                        onDragOver={(e) => handleDragOver(e, actualIndex)}
                        onDragEnd={handleDragEnd}
                        onDrop={(e) => handleDrop(e, actualIndex)}
                        className={`p-3 bg-slate-50 dark:bg-slate-950 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all select-none ${
                          isDragAllowed ? "cursor-move" : ""
                        } ${
                          isDragging
                            ? "opacity-30 border-sky-500 scale-[0.99]"
                            : isOver
                            ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 shadow-md ring-2 ring-sky-500/20"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700"
                        }`}
                      >
                        {/* Video Info: Thumbnail + Title + Badges */}
                        <div className={`flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1 ${isDragging ? "pointer-events-none" : ""}`}>
                          {/* Drag Handle Icon (desktop only) */}
                          <div
                            className={`hidden sm:block text-slate-400 ${
                              isDragAllowed ? "hover:text-sky-500 cursor-grab active:cursor-grabbing" : "opacity-30 cursor-not-allowed"
                            }`}
                            title={isDragAllowed ? "Drag to reorder" : "Clear search/filter to reorder"}
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Sequential Index */}
                          <span className="w-6 sm:w-7 text-center text-xs font-mono font-bold text-slate-400 dark:text-slate-500 shrink-0 pt-0.5 sm:pt-0">
                            #{actualIndex + 1}
                          </span>

                          {/* Thumbnail with duration overlay on mobile */}
                          <div className="relative shrink-0">
                            <img
                              src={vid.thumbnailUrl}
                              alt={vid.title}
                              draggable={false}
                              className="w-16 h-11 sm:w-16 sm:h-10 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-slate-800 select-none shadow-sm"
                            />
                            <span className="sm:hidden absolute bottom-0.5 right-0.5 text-[9px] font-mono px-1 rounded bg-black/80 text-white font-semibold">
                              {vid.duration}
                            </span>
                          </div>

                          <div className="min-w-0 space-y-1.5 sm:space-y-1 flex-1">
                            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 sm:truncate leading-snug">
                              {vid.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              {/* Category Badge */}
                              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                                {vid.category}
                              </span>

                              {vid.episode !== undefined && (
                                <span className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20">
                                  Ep {vid.episode}
                                </span>
                              )}

                              {vid.hasNotes ? (
                                <span className="text-[10px] px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
                                  <FileText className="w-2.5 h-2.5" /> Notes
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 sm:px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-400">
                                  No Notes
                                </span>
                              )}

                              <span className="hidden sm:inline-block text-[11px] text-slate-500 font-mono">
                                {vid.duration}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions Toolbar: Full width with dedicated buttons on mobile, compact horizontal on desktop */}
                        <div 
                          className="flex items-center justify-between sm:justify-end gap-1.5 pt-2 sm:pt-0 border-t border-slate-200/70 dark:border-slate-800/70 sm:border-t-0 w-full sm:w-auto shrink-0" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleOpenEditVideo(vid)}
                            className="flex-1 sm:flex-initial px-3 py-1.5 text-sky-600 dark:text-sky-400 hover:text-white hover:bg-sky-500 bg-sky-500/10 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold border border-sky-500/30 shadow-sm"
                            title="Edit video & attach notes"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveVideo(actualIndex, "up")}
                              disabled={actualIndex === 0}
                              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-20 rounded-lg transition-colors"
                              title="Move up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moveVideo(actualIndex, "down")}
                              disabled={actualIndex === videos.length - 1}
                              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-20 rounded-lg transition-colors"
                              title="Move down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={vid.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Open on YouTube"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleDeleteVideo(vid.id)}
                              className="p-1.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}

        {/* ================= TAB 2: PLAYLISTS & SEQUENCE MANAGER ================= */}
        {activeTab === "playlists" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Create Playlist Form (Left Column) */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm h-fit">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-sky-500" />
                Create New Playlist
              </h2>

              <form onSubmit={handleCreatePlaylist} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Playlist Title</label>
                  <input
                    type="text"
                    value={plTitle}
                    onChange={(e) => setPlTitle(e.target.value)}
                    placeholder="e.g. Salesforce Flows Complete Series"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={plCategory}
                    onChange={(e) => setPlCategory(e.target.value as Playlist["category"])}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Flows">Flows</option>
                    <option value="Security">Security</option>
                    <option value="Admin">Admin</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    value={plDescription}
                    onChange={(e) => setPlDescription(e.target.value)}
                    rows={3}
                    placeholder="Brief description of the course..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={plSubmitting}
                  className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {plSubmitting ? "Creating..." : "Save Playlist"}
                </button>
              </form>

              {/* Playlists List */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Existing Playlists ({playlists.length})
                </h3>
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlaylistForReorder(pl.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                      selectedPlaylistForReorder === pl.id
                        ? "bg-sky-500/10 border-sky-500/40 dark:bg-sky-500/20"
                        : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {pl.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {pl.videoIds.length} episodes • {pl.category}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(pl.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Playlist Video Sequence & Reorder (Right Column) */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-500" />
                    {activePlaylistData ? activePlaylistData.title : "Select a playlist"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Reorder videos within this specific playlist sequence.
                  </p>
                </div>

                {activePlaylistData && (
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-semibold self-start sm:self-auto">
                    {activePlaylistData.videoIds.length} Lessons
                  </span>
                )}
              </div>

              {!activePlaylistData || activePlaylistData.videoIds.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No videos assigned to this playlist yet. Add videos to this playlist using the &ldquo;Add YouTube Video&rdquo; modal.
                </div>
              ) : (
                <div className="space-y-2">
                  {activePlaylistData.videoIds.map((vId, vIdx) => {
                    const vidObj = videos.find((v) => v.youtubeId === vId);
                    const isDragging = draggedPlIndex === vIdx;
                    const isOver = dragOverPlIndex === vIdx;

                    return (
                      <div
                        key={vId}
                        draggable
                        onDragStart={(e) => handlePlDragStart(e, vIdx)}
                        onDragOver={(e) => handlePlDragOver(e, vIdx)}
                        onDragEnd={handlePlDragEnd}
                        onDrop={(e) => handlePlDrop(e, vIdx, activePlaylistData.id)}
                        className={`p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-950 border rounded-xl flex items-center justify-between gap-2.5 sm:gap-4 transition-all cursor-move select-none ${
                          isDragging
                            ? "opacity-30 border-sky-500 scale-[0.99]"
                            : isOver
                            ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 shadow-md ring-2 ring-sky-500/20"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className={`flex items-center gap-2 sm:gap-3 min-w-0 flex-1 ${isDragging ? "pointer-events-none" : ""}`}>
                          {/* Drag Handle (desktop only) */}
                          <div className="hidden sm:block text-slate-400 hover:text-sky-500 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <span className="w-5 sm:w-6 text-center text-xs font-mono font-bold text-slate-400 shrink-0">
                            #{vIdx + 1}
                          </span>

                          {vidObj ? (
                            <>
                              <img
                                src={vidObj.thumbnailUrl}
                                alt={vidObj.title}
                                draggable={false}
                                className="w-12 h-8 sm:w-14 sm:h-9 object-cover rounded-md border border-slate-200 dark:border-slate-800 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                  {vidObj.title}
                                </h5>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {vidObj.duration}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="text-xs font-mono text-slate-400">
                              Video ID: {vId}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => movePlaylistVideo(activePlaylistData.id, vIdx, vIdx - 1)}
                            disabled={vIdx === 0}
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-20 rounded-lg transition-colors"
                            title="Move up in playlist"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => movePlaylistVideo(activePlaylistData.id, vIdx, vIdx + 1)}
                            disabled={vIdx === activePlaylistData.videoIds.length - 1}
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-20 rounded-lg transition-colors"
                            title="Move down in playlist"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: STUDY NOTES ================= */}
        {activeTab === "notes" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Note Editor Form */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  Publish Protected Study Note
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  Protected Document Viewer
                </span>
              </div>

              {noteMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    noteMessage.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{noteMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Guide Title</label>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="e.g. Episode 2: Salesforce Objects Guide"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Episode #</label>
                    <input
                      type="number"
                      value={noteEpisode}
                      onChange={(e) => setNoteEpisode(e.target.value)}
                      placeholder="e.g. 2"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value as NoteDoc["category"])}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Flows">Flows</option>
                      <option value="Apex">Apex</option>
                      <option value="Security">Security</option>
                      <option value="Validation Rules">Validation Rules</option>
                      <option value="Interview Prep">Interview Prep</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Badge</label>
                    <input
                      type="text"
                      value={noteBadge}
                      onChange={(e) => setNoteBadge(e.target.value)}
                      placeholder="e.g. Official Study Guide"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Read Time</label>
                    <input
                      type="text"
                      value={noteReadTime}
                      onChange={(e) => setNoteReadTime(e.target.value)}
                      placeholder="e.g. 15 min read"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Cloudinary PDF Upload Component */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                      <UploadCloud className="w-4 h-4 text-emerald-500" />
                      Upload PDF Study Document (Direct to Cloudinary)
                    </label>
                    {uploadingPdf && (
                      <span className="text-[11px] text-sky-500 flex items-center gap-1 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading to Cloudinary...
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Select your PDF study guide. It is uploaded to Cloudinary and opens seamlessly in the website reader.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfUpload}
                        disabled={uploadingPdf}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-950 file:text-emerald-600 dark:file:text-emerald-400 hover:file:bg-emerald-100 cursor-pointer"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Or paste direct Cloudinary PDF URL..."
                        value={notePdfUrl}
                        onChange={(e) => setNotePdfUrl(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                  {notePdfUrl && (
                    <div className="flex items-center justify-between text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg">
                      <span className="truncate max-w-[80%] flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 shrink-0" /> {notePdfUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => setNotePdfUrl("")}
                        className="text-slate-400 hover:text-red-500 text-xs ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Executive Summary (Optional)</label>
                  <textarea
                    value={noteSummary}
                    onChange={(e) => setNoteSummary(e.target.value)}
                    rows={2}
                    placeholder="Brief 1-2 sentence overview of what this PDF covers..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isFeaturedNote"
                    checked={noteIsFeatured}
                    onChange={(e) => setNoteIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 dark:border-slate-700 focus:ring-sky-500"
                  />
                  <label htmlFor="isFeaturedNote" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Feature this note at top of Study Notes library
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={noteSubmitting}
                  className="w-full py-3 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {noteSubmitting ? "Publishing PDF Guide..." : "Publish Episode PDF Guide"}
                </button>
              </form>
            </div>

            {/* Existing Notes List */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm h-fit">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Published Notes ({notes.length})
              </h3>

              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                          {note.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {note.readTime}
                        </span>
                        {note.pdfUrl && (
                          <a
                            href={note.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5"
                            title="Open Cloudinary Document"
                          >
                            <FileText className="w-2.5 h-2.5" /> PDF
                          </a>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {note.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: CREATOR PROFILE ================= */}
        {activeTab === "profile" && (
          <div className="max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="space-y-1 border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-sky-500" />
                Manage Creator Profile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your public profile details. All changes appear immediately on the About SacWac page.
              </p>
            </div>

            {profileMsg && (
              <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-xs text-sky-600 dark:text-sky-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Professional Title</label>
                  <input
                    type="text"
                    value={profileTitle}
                    onChange={(e) => setProfileTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Avatar / Profile Photo URL
                </label>
                <input
                  type="text"
                  value={profileAvatarUrl}
                  onChange={(e) => setProfileAvatarUrl(e.target.value)}
                  placeholder="https://... (Leave empty to use official SacWac Brand Badge)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
                <p className="text-[11px] text-slate-400">
                  If left blank or deleted, a high-res SacWac logo badge is automatically used.
                </p>

                {profileAvatarUrl && (
                  <div className="pt-2 flex items-center gap-4 p-3 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                    <img
                      src={profileAvatarUrl}
                      alt="Preview"
                      className="w-20 h-28 object-cover rounded-xl border border-sky-400 shadow-sm"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Live Portrait Preview
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Renders in high definition portrait mode on the About SacWac page.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Bio</label>
                <textarea
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Official Channel Email</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Official Work Email</label>
                  <input
                    type="email"
                    value={profileWorkEmail}
                    onChange={(e) => setProfileWorkEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    value={profileLinkedin}
                    onChange={(e) => setProfileLinkedin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Topmate Mentorship URL</label>
                  <input
                    type="text"
                    value={profileTopmate}
                    onChange={(e) => setProfileTopmate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">YouTube Channel URL</label>
                <input
                  type="text"
                  value={profileYoutube}
                  onChange={(e) => setProfileYoutube(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {profileSaving ? "Saving..." : "Save Profile Details"}
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 5: SUPPORTERS & DONATIONS MANAGER ================= */}
        {activeTab === "donations" && (() => {
          const totalRaised = donations.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
          const publishedCount = donations.filter((d) => d.status === "published").length;
          const pendingCount = donations.filter((d) => d.status === "pending").length;

          const filteredList = donations.filter((d) => {
            const matchesStatus =
              donationFilter === "all" || d.status === donationFilter;
            const matchesQuery =
              !donationSearchQuery.trim() ||
              d.name.toLowerCase().includes(donationSearchQuery.toLowerCase()) ||
              (d.message && d.message.toLowerCase().includes(donationSearchQuery.toLowerCase()));
            return matchesStatus && matchesQuery;
          });

          return (
            <div className="space-y-6">
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Contributions</span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    ₹{totalRaised.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Supporters</span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                    {donations.length}
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Published Live</span>
                  <div className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 font-mono mt-0.5">
                    {publishedCount}
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Pending Approval</span>
                  <div className="text-xl sm:text-2xl font-black text-amber-500 font-mono mt-0.5 flex items-center gap-1.5">
                    {pendingCount}
                    {pendingCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                        Needs Action
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content Grid: Left side Supporter List, Right side Donation Page Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Supporter Entries Table */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-amber-500" />
                        Supporter Contributions ({filteredList.length})
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Review, approve, or edit entries submitted from the /support page.
                      </p>
                    </div>

                    <Link
                      href="/supporters"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-500 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors self-start sm:self-auto"
                    >
                      View Live Hall of Fame <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search supporter by name or message..."
                        value={donationSearchQuery}
                        onChange={(e) => setDonationSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      {donationSearchQuery && (
                        <button
                          onClick={() => setDonationSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                      {(["all", "published", "pending"] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setDonationFilter(st)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-colors ${
                            donationFilter === st
                              ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm"
                              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          {st} ({st === "all" ? donations.length : st === "published" ? publishedCount : pendingCount})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Entries List */}
                  {filteredList.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      No supporter records found.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredList.map((item) => (
                        <div
                          key={item._id}
                          className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                {item.name}
                              </h4>
                              <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                ₹{Number(item.amount).toLocaleString("en-IN")}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                  item.status === "published"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                }`}
                              >
                                {item.status === "published" ? "Live" : "Pending Confirmation"}
                              </span>
                            </div>

                            {item.message && (
                              <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                                &ldquo;{item.message}&rdquo;
                              </p>
                            )}

                            <span className="text-[10px] text-slate-400 font-mono block">
                              {new Date(item.createdAt).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t border-slate-200/60 dark:border-slate-800/60 sm:border-t-0">
                            <button
                              onClick={() => handleToggleDonationStatus(item._id, item.status)}
                              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1 ${
                                item.status === "pending"
                                  ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-sm"
                                  : "bg-slate-200 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                              }`}
                              title={item.status === "pending" ? "Approve and publish" : "Unpublish to pending"}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{item.status === "pending" ? "Approve" : "To Pending"}</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditDonation(item)}
                              className="p-1.5 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 border border-sky-500/30 rounded-lg transition-colors"
                              title="Edit supporter details"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteDonation(item._id)}
                              className="p-1.5 text-red-500 hover:bg-red-500/10 border border-red-500/30 rounded-lg transition-colors"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Donation Page Settings Form */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm h-fit">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Save className="w-4 h-4 text-sky-500" />
                      Donation Page Configuration
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Update the text and UPI QR code shown on /support.
                    </p>
                  </div>

                  {donSettingsMsg && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{donSettingsMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveDonationSettings} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        About Title
                      </label>
                      <input
                        type="text"
                        value={donAboutTitle}
                        onChange={(e) => setDonAboutTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        About Bio & Community Message
                      </label>
                      <textarea
                        value={donAboutText}
                        onChange={(e) => setDonAboutText(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        UPI QR Code Image Path or Cloudinary URL
                      </label>
                      <input
                        type="text"
                        value={donQrImage}
                        onChange={(e) => setDonQrImage(e.target.value)}
                        placeholder="/images/payment-qr.png"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                      />
                      <div className="pt-2 flex items-center justify-center p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <img
                          src={donQrImage || "/images/payment-qr.png"}
                          alt="QR Preview"
                          className="w-24 h-24 object-contain rounded-lg border border-slate-300 dark:border-slate-700 bg-white p-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Quick Preset Amounts (Comma Separated in ₹)
                      </label>
                      <input
                        type="text"
                        value={donQuickAmounts}
                        onChange={(e) => setDonQuickAmounts(e.target.value)}
                        placeholder="500, 1000, 2500, 5000"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={donSettingsSaving}
                      className="w-full py-2.5 text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      {donSettingsSaving ? "Saving Settings..." : "Save Donation Settings"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })()}
      </main>

      {/* ================= MODAL: ADD YOUTUBE VIDEO ================= */}
      {isAddVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-600 dark:text-sky-400">
                  <VideoIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Add YouTube Video Link</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paste any YouTube URL. Title, duration, and full description are auto-detected!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddVideoModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {videoModalMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  videoModalMsg.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
                }`}
              >
                {videoModalMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{videoModalMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleAddVideo} className="space-y-4 text-xs">
              {/* URL Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">YouTube Video URL</label>
                  {fetchingDetails && (
                    <span className="text-[11px] text-sky-500 flex items-center gap-1 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin" /> Fetching YouTube info...
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Live Thumbnail Preview */}
              {extractedVidId && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4">
                  <img
                    src={getYoutubeThumbnail(extractedVidId)}
                    alt="Preview"
                    draggable={false}
                    className="w-28 aspect-video object-cover rounded-xl border border-slate-200 dark:border-slate-800 shrink-0"
                  />
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                      Video ID: {extractedVidId}
                    </span>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {videoTitle || "Salesforce Masterclass"}
                    </p>
                    <p className="text-[11px] text-slate-400">Duration: {videoDuration}</p>
                  </div>
                </div>
              )}

              {/* Title & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Title</label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Video Title"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Duration</label>
                  <input
                    type="text"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    placeholder="e.g. 21:10"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={videoCategory}
                  onChange={(e) => setVideoCategory(e.target.value as Video["category"])}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Flows">Flows</option>
                  <option value="Security">Security</option>
                  <option value="Admin">Admin</option>
                  <option value="Apex">Apex</option>
                  <option value="Validation Rules">Validation Rules</option>
                  <option value="Scenarios">Scenarios</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  rows={3}
                  placeholder="Detailed video description..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Playlist Assignment + Create On The Spot */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-500" />
                    Assign to Playlist (Optional)
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowInlineNewPlaylist(!showInlineNewPlaylist)}
                    className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {showInlineNewPlaylist ? "Choose Existing" : "+ Create Playlist On The Spot"}
                  </button>
                </div>

                {!showInlineNewPlaylist ? (
                  <select
                    value={targetPlaylistId}
                    onChange={(e) => setTargetPlaylistId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="">No Playlist (Standalone Video)</option>
                    {playlists.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.title} ({pl.category})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      value={newPlaylistTitle}
                      onChange={(e) => setNewPlaylistTitle(e.target.value)}
                      placeholder="New Playlist Name (e.g. Salesforce Apex Complete)"
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                    <p className="text-[11px] text-slate-400">
                      This playlist will be automatically created and this video will be added as Lesson #1!
                    </p>
                  </div>
                )}
              </div>

              {/* Episode & Cloudinary PDF Guide Section */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    Episode Details & PDF Study Guide (Optional)
                  </label>
                  {videoUploadingNotes && (
                    <span className="text-[11px] text-sky-500 flex items-center gap-1 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> Uploading PDF to Cloudinary...
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Episode Number
                  </label>
                  <input
                    type="number"
                    value={videoEpisode}
                    onChange={(e) => setVideoEpisode(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5 text-emerald-500" />
                    Upload PDF Document or Paste Cloudinary URL
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleUploadPdfForVideo(e, false)}
                      disabled={videoUploadingNotes}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-950 file:text-emerald-600 dark:file:text-emerald-400 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="PDF URL..."
                      value={videoNotesPdfUrl}
                      onChange={(e) => setVideoNotesPdfUrl(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  {videoNotesPdfUrl && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Attached PDF: <span className="truncate max-w-[80%] font-mono">{videoNotesPdfUrl}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddVideoModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={videoSubmitting}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {videoSubmitting ? "Uploading Video..." : "Upload YouTube Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT VIDEO & MANAGE NOTES ================= */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-600 dark:text-sky-400">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Video & Manage Notes</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Update video details, set episode numbers, or attach .txt/.md/PDF study notes.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingVideo(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  editMsg.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
                }`}
              >
                {editMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{editMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditVideo} className="space-y-4 text-xs">
              {/* Video Title */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Video Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Category, Duration, Episode, Difficulty */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as Video["category"])}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  >
                    {VIDEO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Episode #</label>
                  <input
                    type="number"
                    value={editEpisode}
                    onChange={(e) => setEditEpisode(e.target.value)}
                    placeholder="e.g. 2"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Duration</label>
                  <input
                    type="text"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    placeholder="9:40"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Level</label>
                  <select
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(e.target.value as Video["difficulty"])}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Study Notes & Cloudinary PDF Section */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    Episode PDF Study Guide
                  </label>
                  {editUploadingNotes && (
                    <span className="text-[11px] text-sky-500 flex items-center gap-1 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> Uploading PDF to Cloudinary...
                    </span>
                  )}
                </div>

                {/* Cloudinary PDF Upload & Link */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5 text-emerald-500" />
                    Upload PDF Document or Paste Cloudinary URL
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleUploadPdfForVideo(e, true)}
                      disabled={editUploadingNotes}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-950 file:text-emerald-600 dark:file:text-emerald-400 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Or paste direct Cloudinary PDF URL..."
                      value={editNotesPdfUrl}
                      onChange={(e) => setEditNotesPdfUrl(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  {editNotesPdfUrl && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Attached PDF: <span className="truncate max-w-[80%] font-mono">{editNotesPdfUrl}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {editSubmitting ? "Saving Changes..." : "Save Video & Notes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT SUPPORTER ENTRY ================= */}
      {editingDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Supporter Entry</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Update supporter name, amount, or message.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingDonation(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {donationMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  donationMsg.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
                }`}
              >
                {donationMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveEditDonation} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Supporter Name</label>
                <input
                  type="text"
                  value={editDonationName}
                  onChange={(e) => setEditDonationName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Amount (₹)</label>
                <input
                  type="number"
                  value={editDonationAmount}
                  onChange={(e) => setEditDonationAmount(e.target.value)}
                  required
                  min={1}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Message (Optional)</label>
                <textarea
                  value={editDonationMessage}
                  onChange={(e) => setEditDonationMessage(e.target.value)}
                  rows={2}
                  maxLength={300}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Publication Status</label>
                <select
                  value={editDonationStatus}
                  onChange={(e) => setEditDonationStatus(e.target.value as "pending" | "published")}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="published">Published (Visible on /supporters)</option>
                  <option value="pending">Pending Confirmation</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingDonation(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
