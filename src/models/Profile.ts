import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProfile extends Document {
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  topmateUrl: string;
  email: string;
  workEmail: string;
}

const ProfileSchema: Schema<IProfile> = new Schema(
  {
    name: { type: String, default: "Sachin Singh" },
    title: { type: String, default: "Salesforce Specialist & Content Creator at SacWac" },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    youtubeUrl: { type: String, default: "https://www.youtube.com/@SachinSingh-n2g7t" },
    linkedinUrl: { type: String, default: "https://www.linkedin.com/in/sachin-singh-040290218/" },
    topmateUrl: { type: String, default: "https://topmate.io/sacwac" },
    email: { type: String, default: "sacwacsalesforce@gmail.com" },
    workEmail: { type: String, default: "sacwac.work@gmail.com" },
  },
  { timestamps: true }
);

export const ProfileModel: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);
