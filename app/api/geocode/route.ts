import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
        return NextResponse.json({ location: "India" });
    }

    try {
        const res = await fetch(
            `https://atlas.microsoft.com/search/address/reverse/json?api-version=1.0&query=${lat},${lng}&subscription-key=${process.env.NEXT_PUBLIC_AZURE_MAPS_KEY}`
        );
        const data = await res.json();
        const addr = data.addresses?.[0]?.address;
        const location =
            addr?.municipalitySubdivision ||
            addr?.municipality ||
            addr?.countrySubdivision ||
            "India";
        return NextResponse.json({ location });
    } catch {
        return NextResponse.json({ location: "India" });
    }
}
