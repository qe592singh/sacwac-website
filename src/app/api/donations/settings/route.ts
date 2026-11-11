import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import {
  DonationSettingModel,
  DEFAULT_DONATION_SETTINGS,
} from "@/models/DonationSetting";

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await DonationSettingModel.findOne().lean();
    return NextResponse.json({
      success: true,
      settings: settings || DEFAULT_DONATION_SETTINGS,
    });
  } catch (error) {
    console.error("GET /api/donations/settings error:", error);
    return NextResponse.json({
      success: true,
      settings: DEFAULT_DONATION_SETTINGS,
    });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { aboutTitle, aboutText, qrImage, quickAmounts } = body;

    const updateData: Record<string, unknown> = {};
    if (aboutTitle) updateData.aboutTitle = String(aboutTitle).trim().slice(0, 100);
    if (aboutText) updateData.aboutText = String(aboutText).trim().slice(0, 3000);
    if (qrImage) updateData.qrImage = String(qrImage).trim();
    if (Array.isArray(quickAmounts) && quickAmounts.length > 0) {
      updateData.quickAmounts = quickAmounts
        .map((a: unknown) => Number(a))
        .filter((n: number) => !isNaN(n) && n > 0);
    }

    await connectToDatabase();
    const updated = await DonationSettingModel.findOneAndUpdate(
      {},
      { $set: updateData },
      { upsert: true, returnDocument: "after" }
    );

    return NextResponse.json({
      success: true,
      message: "Donation settings saved successfully!",
      settings: updated,
    });
  } catch (error) {
    console.error("PUT /api/donations/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update donation settings" },
      { status: 500 }
    );
  }
}
