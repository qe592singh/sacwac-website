export function formatVideoDate(raw?: string | Date | null): string {
  if (!raw) {
    const d = new Date();
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const d = new Date(raw);
  if (isNaN(d.getTime())) {
    return String(raw);
  }

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getVideoTimestamp(v: { publishedAt?: string; date?: string; createdAt?: string | Date }): number {
  if (v.publishedAt) {
    const t = new Date(v.publishedAt).getTime();
    if (!isNaN(t)) return t;
  }
  if (v.createdAt) {
    const t = new Date(v.createdAt).getTime();
    if (!isNaN(t)) return t;
  }
  if (v.date) {
    const t = new Date(v.date).getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
}

export function getDynamicPlaylistTitle(playlist: {
  id?: string;
  title?: string;
  videoIds?: string[];
  videos?: unknown[];
  totalEpisodes?: number;
}): string {
  const count =
    playlist.videoIds?.length ??
    (playlist.videos?.length ?? playlist.totalEpisodes ?? 0);

  const rawTitle = (playlist.title || "")
    .replace(/\s*\((?:Episodes?\s*\d+\s*-\s*\d+|Episodes?\s*\d+|\d+\s*Lessons?)\)\s*$/i, "")
    .trim();

  // For Flow Builder course or any playlist indicating episodes
  if (
    playlist.id === "playlist-flows" ||
    /flow/i.test(playlist.id || "") ||
    /episode/i.test(playlist.title || "")
  ) {
    if (count <= 0) return rawTitle;
    if (count === 1) return `${rawTitle} (Episode 1)`;
    return `${rawTitle} (Episodes 1 - ${count})`;
  }

  // For Admin or Security or other courses indicating lessons
  if (
    playlist.id === "playlist-admin" ||
    playlist.id === "playlist-security" ||
    /lesson/i.test(playlist.title || "")
  ) {
    if (count <= 0) return rawTitle;
    return `${rawTitle} (${count} ${count === 1 ? "Lesson" : "Lessons"})`;
  }

  // Fallback: if count > 0 and rawTitle exists, show lessons or episodes
  if (count > 0 && rawTitle) {
    return `${rawTitle} (${count} ${count === 1 ? "Lesson" : "Lessons"})`;
  }

  return rawTitle;
}
