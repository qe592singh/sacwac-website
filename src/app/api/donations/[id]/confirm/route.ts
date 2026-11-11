import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { DonationModel } from "@/models/Donation";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid donation ID" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const result = await DonationModel.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "published",
          confirmedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Donation record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, donation: result });
  } catch (error) {
    console.error("POST /api/donations/[id]/confirm error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to confirm donation" },
      { status: 500 }
    );
  }
}
