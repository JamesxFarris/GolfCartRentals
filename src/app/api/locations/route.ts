import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateSlug = searchParams.get("state") || "";

    const where: Record<string, unknown> = { active: true };

    if (stateSlug) {
      where.stateSlug = stateSlug;
    }

    const locations = await prisma.location.findMany({
      where,
      orderBy: [{ state: "asc" }, { city: "asc" }],
    });

    // Get listing counts for each location
    const locationsWithCounts = await Promise.all(
      locations.map(async (location: { city: string; state: string }) => {
        const listingCount = await prisma.listing.count({
          where: {
            city: { equals: location.city, mode: "insensitive" },
            state: { equals: location.state, mode: "insensitive" },
            active: true,
          },
        });
        return { ...location, listingCount };
      })
    );

    return NextResponse.json(locationsWithCounts);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
