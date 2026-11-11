import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDonation extends Document {
  name: string;
  message?: string;
  amount: number;
  status: "pending" | "published";
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema: Schema<IDonation> = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    message: { type: String, default: "", trim: true, maxlength: 300 },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["pending", "published"],
      default: "pending",
      index: true,
    },
    confirmedAt: { type: Date },
  },
  { timestamps: true }
);

export const DonationModel: Model<IDonation> =
  mongoose.models.Donation || mongoose.model<IDonation>("Donation", DonationSchema);
