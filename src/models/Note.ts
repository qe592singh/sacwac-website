import mongoose, { Schema, Document, Model } from "mongoose";

export interface INoteSection {
  heading: string;
  content: string;
  codeSnippet?: string;
  language?: string;
  keyTakeaways?: string[];
}

export interface INoteDoc extends Document {
  id: string;
  title: string;
  category: "Flows" | "Apex" | "Security" | "Validation Rules" | "Interview Prep" | "Admin";
  summary: string;
  readTime: string;
  updatedAt: string;
  badge: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  sections: INoteSection[];
  pdfUrl?: string;
  isFeatured?: boolean;
  order?: number;
  episode?: number;
  videoId?: string;
  rawContent?: string;
}

const NoteSectionSchema = new Schema(
  {
    heading: { type: String, required: true },
    content: { type: String, required: true },
    codeSnippet: { type: String },
    language: { type: String, default: "apex" },
    keyTakeaways: [{ type: String }],
  },
  { _id: false }
);

const NoteDocSchema: Schema<INoteDoc> = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["Flows", "Apex", "Security", "Validation Rules", "Interview Prep", "Admin"],
      required: true,
      index: true,
    },
    summary: { type: String, required: true },
    readTime: { type: String, default: "10 min read" },
    updatedAt: { type: String, required: true },
    badge: { type: String, default: "Architecture Guide" },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    sections: [NoteSectionSchema],
    pdfUrl: { type: String },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    episode: { type: Number, index: true },
    videoId: { type: String, index: true },
    rawContent: { type: String },
  },
  { timestamps: true }
);

export const NoteModel: Model<INoteDoc> =
  mongoose.models.NoteDoc || mongoose.model<INoteDoc>("NoteDoc", NoteDocSchema);
