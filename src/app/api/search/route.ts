import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "";
    const passengers = searchParams.get("passengers");
    const features = searchParams.get("features") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 20;

    const where: Record<string, unknown> = { active: true };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { state: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    if (type) {
      const types = type.split(",").map((t) => t.trim());
      where.cartTypes = { hasSome: types };
    }

    if (passengers) {
      where.maxPassengers = { gte: parseInt(passengers, 10) };
    }

    if (features) {
      const featureList = features.split(",").map((f) => f.trim());
      where.features = { hasSome: featureList };
    }

    if (minPrice) {
      where.rateDaily = {
        ...(where.rateDaily as Record<string, unknown> || {}),
        gte: parseFloat(minPrice),
      };
    }

    if (maxPrice) {
      where.rateDaily = {
        ...(where.rateDaily as Record<string, unknown> || {}),
        lte: parseFloat(maxPrice),
      };
    }

    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error searching listings:", error);
    return NextResponse.json(
      { error: "Failed to search listings" },
      { status: 500 }
    );
  }
}
