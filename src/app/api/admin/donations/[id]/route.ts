import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { DonationModel } from "@/models/Donation";

export async function PATCH(
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

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = String(body.name).trim().slice(0, 80);
    if (body.message !== undefined) updateData.message = String(body.message).trim().slice(0, 300);
    if (body.amount !== undefined) {
      const parsed = Number(body.amount);
      if (!isNaN(parsed) && parsed > 0) updateData.amount = parsed;
    }
    if (body.status === "published" || body.status === "pending") {
      updateData.status = body.status;
      if (body.status === "published" && !body.confirmedAt) {
        updateData.confirmedAt = new Date();
      }
    }

    await connectToDatabase();
    const updated = await DonationModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Donation record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Supporter entry updated successfully!",
      donation: updated,
    });
  } catch (error) {
    console.error("PATCH /api/admin/donations/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update donation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const deleted = await DonationModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Donation record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Supporter entry deleted successfully!",
    });
  } catch (error) {
    console.error("DELETE /api/admin/donations/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete donation" },
      { status: 500 }
    );
  }
}
