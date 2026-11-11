import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { DonationModel } from "@/models/Donation";

let cachedDonationsData: { data: unknown; time: number } | null = null;
const CACHE_TTL_MS = 30 * 1000;

export async function GET() {
  if (cachedDonationsData && Date.now() - cachedDonationsData.time < CACHE_TTL_MS) {
    return NextResponse.json(cachedDonationsData.data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
      },
    });
  }

  try {
    await connectToDatabase();
    const donations = await DonationModel.find({ status: "published" })
      .sort({ createdAt: -1 })
      .select("name message amount createdAt")
      .lean();

    const payload = { success: true, donations };
    cachedDonationsData = { data: payload, time: Date.now() };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("GET /api/donations error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch donations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  cachedDonationsData = null;
  try {
    const body = await request.json();
    const name = String(body.name || "").trim().slice(0, 80);
    const message = String(body.message || "").trim().slice(0, 300);
    const amount = Number(body.amount);

    if (!name || !Number.isFinite(amount) || amount < 1 || amount > 10000000) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid name and donation amount." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const donation = await DonationModel.create({
      name,
      message,
      amount,
      status: "pending",
    });

    return NextResponse.json(
      { success: true, id: donation._id.toString(), donation },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/donations error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error creating donation" },
      { status: 500 }
    );
  }
}
