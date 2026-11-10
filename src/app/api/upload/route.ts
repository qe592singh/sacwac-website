import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "sacwac_docs";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save locally to public/docs/uploads/ for instant 100% reliable viewing (avoids Cloudinary 401 ACL blockage)
    const sanitizedName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public", "docs", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const localFilePath = path.join(uploadDir, sanitizedName);
    fs.writeFileSync(localFilePath, buffer);
    const localUrl = `/docs/uploads/${sanitizedName}`;

    let cloudinaryUrl: string | undefined = undefined;
    try {
      const result = await uploadToCloudinary(buffer, folder, file.name);
      cloudinaryUrl = result.secure_url;
    } catch (cErr) {
      console.warn("Cloudinary upload notice (local backup retained):", cErr);
    }

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: localUrl,
      cloudinaryUrl: cloudinaryUrl,
      localUrl: localUrl,
      bytes: buffer.length,
    });
  } catch (error: unknown) {
    console.error("Upload failed:", error);
    const msg = error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
