import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVisitorLog extends Document {
  path: string;
  ip: string;
  country?: string;
  city?: string;
  device: "desktop" | "mobile" | "tablet";
  browser?: string;
  os?: string;
  referrer?: string;
  referrerDomain?: string;
  createdAt: Date;
}

const VisitorLogSchema: Schema<IVisitorLog> = new Schema(
  {
    path: { type: String, required: true, trim: true, index: true },
    ip: { type: String, default: "anonymous", index: true },
    country: { type: String, default: "Unknown" },
    city: { type: String, default: "Unknown" },
    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet"],
      default: "desktop",
      index: true,
    },
    browser: { type: String, default: "Unknown" },
    os: { type: String, default: "Unknown" },
    referrer: { type: String, default: "" },
    referrerDomain: { type: String, default: "Direct", index: true },
  },
  { timestamps: true }
);

VisitorLogSchema.index({ createdAt: -1 });
VisitorLogSchema.index({ ip: 1, createdAt: -1 });

export const VisitorLogModel: Model<IVisitorLog> =
  mongoose.models.VisitorLog || mongoose.model<IVisitorLog>("VisitorLog", VisitorLogSchema);
