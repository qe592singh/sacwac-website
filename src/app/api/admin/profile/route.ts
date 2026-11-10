import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/mongodb";
import { ProfileModel } from "@/models/Profile";

const profilePath = path.join(process.cwd(), "src", "data", "profile.json");

let cachedProfileData: { data: unknown; time: number } | null = null;
const CACHE_TTL_MS = 60 * 1000;

export async function GET() {
  if (cachedProfileData && Date.now() - cachedProfileData.time < CACHE_TTL_MS) {
    return NextResponse.json(cachedProfileData.data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }

  try {
    await connectToDatabase();
    const dbProfile = await ProfileModel.findOne().lean();
    if (dbProfile) {
      const payload = { success: true, profile: dbProfile, source: "mongodb" };
      cachedProfileData = { data: payload, time: Date.now() };
      return NextResponse.json(payload, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }
  } catch (err) {
    console.error("MongoDB GET profile error, falling back to JSON:", err);
  }

  try {
    if (!fs.existsSync(profilePath)) {
      return NextResponse.json({ success: true, profile: {} });
    }
    const data = JSON.parse(fs.readFileSync(profilePath, "utf8"));
    const localPayload = { success: true, profile: data, source: "local" };
    cachedProfileData = { data: localPayload, time: Date.now() };
    return NextResponse.json(localPayload, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error reading profile:", error);
    return NextResponse.json({ success: false, error: "Failed to read profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  cachedProfileData = null;
  try {
    const body = await request.json();
    const { name, title, bio, avatarUrl, youtubeUrl, linkedinUrl, email, workEmail, topmateUrl } = body;

    const updatedProfile = {
      name: name || "Sachin Singh",
      title: title || "Salesforce Specialist & Content Creator at SacWac",
      bio: bio || "",
      avatarUrl: avatarUrl ? avatarUrl.trim() : "",
      youtubeUrl: youtubeUrl || "https://www.youtube.com/@SachinSingh-n2g7t",
      linkedinUrl: linkedinUrl || "",
      topmateUrl: topmateUrl || "",
      email: email || "",
      workEmail: workEmail || "",
    };

    // Update in MongoDB
    try {
      await connectToDatabase();
      await ProfileModel.findOneAndUpdate(
        {},
        updatedProfile,
        { upsert: true, returnDocument: "after" }
      );
    } catch (err) {
      console.error("MongoDB POST profile error:", err);
    }

    // Also persist local fallback
    fs.writeFileSync(profilePath, JSON.stringify(updatedProfile, null, 2), "utf8");
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully in MongoDB!",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json({ success: false, error: "Failed to save profile" }, { status: 500 });
  }
}
