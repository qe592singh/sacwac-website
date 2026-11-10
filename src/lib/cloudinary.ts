import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "posrp1og",
  api_key: process.env.CLOUDINARY_API_KEY || "635927884763466",
  api_secret: process.env.CLOUDINARY_API_SECRET || "kcbrrYGz1D_0RFrLnw-L4YkRlDE",
  secure: true,
});

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder = "sacwac_docs",
  filename?: string
): Promise<{ url: string; secure_url: string; public_id: string; format?: string; bytes?: number }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        public_id: filename ? filename.replace(/\.[^/.]+$/, "") : undefined,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.url,
            secure_url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            bytes: result.bytes,
          });
        } else {
          reject(new Error("Unknown upload error"));
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export default cloudinary;
