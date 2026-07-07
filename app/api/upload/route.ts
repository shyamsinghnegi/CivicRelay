import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { BlobServiceClient } from "@azure/storage-blob";
import sharp from "sharp";

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

  const buffer = Buffer.from(await file.arrayBuffer());

  const compressed = await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  const blobName = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "-")}`;

  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.STORAGE_CONNECTION_STRING!
  );
  const containerClient = blobServiceClient.getContainerClient(
    process.env.STORAGE_CONTAINER!
  );

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(compressed, {
    blobHTTPHeaders: { blobContentType: "image/jpeg" },
  });

  return NextResponse.json({ url: blockBlobClient.url });
}
