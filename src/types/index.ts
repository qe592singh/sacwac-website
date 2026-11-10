export interface Video {
  id: string;
  youtubeUrl: string;
  youtubeId: string;
  title: string;
  description: string;
  category: "Flows" | "Apex" | "Security" | "Validation Rules" | "Scenarios" | "Admin" | "Integration" | "General";
  duration: string;
  thumbnailUrl: string;
  date: string;
  publishedAt?: string;
  views?: number;
  viewsText?: string;
  tags?: string[];
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  featured?: boolean;
  episode?: number;
  playlistId?: string;
  order?: number;
  noteId?: string;
  hasNotes?: boolean;
  notesContent?: string;
}

export interface Playlist {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: "Flows" | "Security" | "Admin" | "General";
  level: string;
  totalEpisodes: number;
  thumbnail: string;
  videoIds: string[];
  videos?: Video[];
}

export interface NoteSection {
  heading: string;
  content: string;
  codeSnippet?: string;
  language?: string;
  keyTakeaways?: string[];
}

export interface NoteDoc {
  id: string;
  title: string;
  category: "Flows" | "Apex" | "Security" | "Validation Rules" | "Interview Prep" | "Admin";
  summary: string;
  readTime: string;
  updatedAt: string;
  badge: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  sections: NoteSection[];
  viewsCount?: number;
  pdfUrl?: string;
  isFeatured?: boolean;
  order?: number;
  episode?: number;
  videoId?: string;
  rawContent?: string;
}

export interface CreatorProfile {
  name: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  email?: string;
  workEmail?: string;
  topmateUrl?: string;
}
