import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { DonationModel } from "@/models/Donation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const donations = await DonationModel.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      donations,
    });
  } catch (error) {
    console.error("GET /api/admin/donations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin donations" },
      { status: 500 }
    );
  }
}
