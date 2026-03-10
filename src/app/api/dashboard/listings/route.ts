import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listings = await prisma.listing.findMany({
      where: {
        claimedById: session.user.id,
        active: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        state: true,
        phone: true,
        photos: true,
        rateDaily: true,
        claimStatus: true,
        active: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching dashboard listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
