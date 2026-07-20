import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ImageAnalysisClient, { isUnexpected } from "@azure-rest/ai-vision-image-analysis";
import { AzureKeyCredential } from "@azure/core-auth";
import sharp from "sharp";
import type { IssueCategory } from "../../lib/categories";

const tagToCategoryMap: Record<string, IssueCategory> = {
    // Pothole / road damage
    road: "pothole", asphalt: "pothole", pavement: "pothole", pothole: "pothole", crack: "pothole",
    mud: "pothole", dirt: "pothole", gravel: "pothole", ground: "pothole", soil: "pothole", surface: "pothole",
    tarmac: "pothole", macadam: "pothole", roadway: "pothole", highway: "pothole", lane: "pothole",
    broken: "pothole", damaged: "pothole", deterioration: "pothole", erosion: "pothole", rut: "pothole",

    // Streetlight
    light: "streetlight", lamp: "streetlight", streetlight: "streetlight", lantern: "streetlight",
    pole: "streetlight", post: "streetlight", bulb: "streetlight", illumination: "streetlight",
    darkness: "streetlight", unlit: "streetlight", lamppost: "streetlight", fixture: "streetlight",
    electricity: "streetlight", electric: "streetlight", night: "streetlight",

    // Garbage
    garbage: "garbage", trash: "garbage", waste: "garbage", litter: "garbage", bin: "garbage",
    rubbish: "garbage", junk: "garbage", refuse: "garbage", heap: "garbage", pile: "garbage",
    filth: "garbage", dump: "garbage", rotting: "garbage", decompose: "garbage", stench: "garbage",
    plastic: "garbage", bottle: "garbage", bag: "garbage", container: "garbage", overflowing: "garbage",

    // Water / pipe issues
    water: "water", pipe: "water", flood: "water", leak: "water", puddle: "water",
    waterlogging: "water", overflow: "water", burst: "water", seepage: "water", tap: "water",
    sewage: "water", stagnant: "water", inundation: "water", submersion: "water", wet: "water",

    // Drainage
    drain: "drainage", sewer: "drainage", drainage: "drainage", gutter: "drainage",
    manhole: "drainage", blocked: "drainage", clog: "drainage", culvert: "drainage",
    channel: "drainage", ditch: "drainage", storm: "drainage", runoff: "drainage",

    // Traffic
    traffic: "traffic", signal: "traffic", congestion: "traffic",
    junction: "traffic", intersection: "traffic", crossing: "traffic", barrier: "traffic",
    signage: "traffic", divider: "traffic", median: "traffic", speedbreaker: "traffic",

    // Illegal dumping
    debris: "dumping", rubble: "dumping", construction: "dumping", demolition: "dumping",
    illegal: "dumping", abandoned: "dumping", dumping: "dumping", spoil: "dumping",
    excavation: "dumping", sand: "dumping", brick: "dumping", concrete: "dumping",
};

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Accept multipart file — no URL, no blob storage touched
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image too large" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Resize to 1200px max before sending to Vision — reduces Vision API latency
    let resized: Buffer;
    try {
        resized = await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();
    } catch {
        return NextResponse.json({ error: "blurry", category: null, tags: [] });
    }

    // Send raw bytes to Vision API via base64 data URI
    let result;
    try {
        const client = ImageAnalysisClient(
            process.env.AI_VISION_ENDPOINT!,
            new AzureKeyCredential(process.env.AI_VISION_KEY!)
        );
        const base64 = resized.toString("base64");
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        result = await client.path("/imageanalysis:analyze").post({
            body: { url: dataUrl },
            queryParameters: { features: ["Tags"] },
            contentType: "application/json",
        });
    } catch {
        return NextResponse.json({ error: "Vision API unavailable", category: null, tags: [] });
    }

    if (isUnexpected(result)) {
        return NextResponse.json({ error: "Vision API error", category: null, tags: [] });
    }

    const tags = result.body.tagsResult?.values ?? [];

    if (tags.length === 0) {
        return NextResponse.json({ error: "blurry", category: null, tags: [] });
    }

    const maxConfidence = Math.max(...tags.map((t) => t.confidence));
    if (maxConfidence < 0.5) {
        return NextResponse.json({ error: "blurry", category: null, tags: [] });
    }

    const tagNames = tags.map((t) => t.name.toLowerCase());

    const scores: Partial<Record<IssueCategory, number>> = {};
    for (const tag of tagNames) {
        const cat = tagToCategoryMap[tag];
        if (cat) scores[cat] = (scores[cat] ?? 0) + 1;
    }

    if (Object.keys(scores).length === 0) {
        return NextResponse.json({ error: "no_match", category: null, tags: [] });
    }

    const detectedCategory = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]) as IssueCategory;
    const relevantTags = tagNames.filter((t) => tagToCategoryMap[t]);

    return NextResponse.json({ category: detectedCategory, tags: relevantTags });
}
