export function extractYoutubeId(url: string): string | null {
  if (!url) return null;

  // Patterns matching youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/..., youtube.com/shorts/...
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.trim().match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
}

export function getYoutubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYoutubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`;
}
