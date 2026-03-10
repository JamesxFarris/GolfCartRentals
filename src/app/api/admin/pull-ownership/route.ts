import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId } = await request.json();

    if (!listingId) {
      return NextResponse.json(
        { error: "Listing ID is required" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        claimStatus: "UNCLAIMED",
        claimedById: null,
      },
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Pull ownership error:", error);
    return NextResponse.json(
      { error: "Failed to pull ownership" },
      { status: 500 }
    );
  }
}
