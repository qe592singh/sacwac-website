import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVideo extends Document {
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

const VideoSchema: Schema<IVideo> = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    youtubeUrl: { type: String, required: true },
    youtubeId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Flows", "Apex", "Security", "Validation Rules", "Scenarios", "Admin", "Integration", "General"],
      default: "General",
      index: true,
    },
    duration: { type: String, default: "15:00" },
    thumbnailUrl: { type: String, required: true },
    date: { type: String, required: true },
    publishedAt: { type: String },
    views: { type: Number, default: 0 },
    viewsText: { type: String },
    tags: [{ type: String }],
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    featured: { type: Boolean, default: false },
    episode: { type: Number },
    playlistId: { type: String, index: true },
    order: { type: Number, default: 0 },
    noteId: { type: String },
    hasNotes: { type: Boolean, default: false },
    notesContent: { type: String },
  },
  { timestamps: true }
);

export const VideoModel: Model<IVideo> =
  mongoose.models.Video || mongoose.model<IVideo>("Video", VideoSchema);
