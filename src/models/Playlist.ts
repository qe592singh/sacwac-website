import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPlaylist extends Document {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: "Flows" | "Security" | "Admin" | "General";
  level: string;
  totalEpisodes: number;
  thumbnail: string;
  videoIds: string[];
  videos: Types.ObjectId[];
}

const PlaylistSchema: Schema<IPlaylist> = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Flows", "Security", "Admin", "General"],
      default: "Admin",
    },
    level: { type: String, default: "Beginner to Advanced" },
    totalEpisodes: { type: Number, default: 0 },
    thumbnail: { type: String, default: "" },
    videoIds: [{ type: String }],
    videos: [{ type: Schema.Types.ObjectId, ref: "Video" }],
  },
  { timestamps: true }
);

export const PlaylistModel: Model<IPlaylist> =
  mongoose.models.Playlist || mongoose.model<IPlaylist>("Playlist", PlaylistSchema);
