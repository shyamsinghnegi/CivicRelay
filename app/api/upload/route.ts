import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { BlobServiceClient } from "@azure/storage-blob";
import sharp from "sharp";
import { createHash } from "crypto";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB pre-compression

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 10 MB" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let compressed: Buffer;
  try {
    compressed = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "Invalid or corrupt image file" }, { status: 400 });
  }


  const hash = createHash("sha256").update(buffer).digest("hex");
  const blobName = `uploads/${hash}.jpg`;

  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.STORAGE_CONNECTION_STRING!
  );
  const containerClient = blobServiceClient.getContainerClient(
    process.env.STORAGE_CONTAINER!
  );

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // If the same image was uploaded before, reuse it
  const exists = await blockBlobClient.exists();
  if (!exists) {
    await blockBlobClient.uploadData(compressed, {
      blobHTTPHeaders: { blobContentType: "image/jpeg" },
    });
  }

  return NextResponse.json({ url: blockBlobClient.url });
}
