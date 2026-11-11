import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDonationSetting extends Document {
  aboutTitle: string;
  aboutText: string;
  qrImage: string;
  quickAmounts: number[];
  updatedAt: Date;
}

export const DEFAULT_DONATION_SETTINGS = {
  aboutTitle: "About Sachin Singh",
  aboutText:
    "Hi! I’m Sachin 👋\n\nI create easy-to-understand Salesforce tutorials to help admins, developers, and Salesforce learners build their skills and grow their careers.\n\nI share practical Salesforce concepts, step-by-step demos, and real-world tips through my YouTube channel.\n\nIf my content has helped you learn something new, you can support my work by buying me a coffee ☕ Your support helps me keep creating free Salesforce content for the community.\n\nThank you for your support! 💗",
  qrImage: "/images/payment-qr.png",
  quickAmounts: [500, 1000, 2500, 5000],
};

const DonationSettingSchema: Schema<IDonationSetting> = new Schema(
  {
    aboutTitle: { type: String, default: DEFAULT_DONATION_SETTINGS.aboutTitle },
    aboutText: { type: String, default: DEFAULT_DONATION_SETTINGS.aboutText },
    qrImage: { type: String, default: DEFAULT_DONATION_SETTINGS.qrImage },
    quickAmounts: {
      type: [Number],
      default: DEFAULT_DONATION_SETTINGS.quickAmounts,
    },
  },
  { timestamps: true }
);

export const DonationSettingModel: Model<IDonationSetting> =
  mongoose.models.DonationSetting ||
  mongoose.model<IDonationSetting>("DonationSetting", DonationSettingSchema);
