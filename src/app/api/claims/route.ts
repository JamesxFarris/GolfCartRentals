import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const claims = await prisma.claimRequest.findMany({
      where,
      include: {
        listing: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            claimStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(claims);
  } catch (error) {
    console.error("Error fetching claims:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, name, email, phone, message } = body;

    // Validate required fields
    if (!listingId || !name || !email || !phone) {
      return NextResponse.json(
        { error: "listingId, name, email, and phone are required" },
        { status: 400 }
      );
    }

    // Check listing exists and is not already claimed
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.claimStatus === "CLAIMED") {
      return NextResponse.json(
        { error: "This listing has already been claimed" },
        { status: 400 }
      );
    }

    // Create claim request and update listing status in a transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const claim = await prisma.$transaction(async (tx: any) => {
      const newClaim = await tx.claimRequest.create({
        data: {
          listingId,
          name,
          email,
          phone,
          message: message || null,
          status: "PENDING",
        },
      });

      await tx.listing.update({
        where: { id: listingId },
        data: { claimStatus: "PENDING" },
      });

      return newClaim;
    });

    return NextResponse.json(
      { message: "Claim request submitted successfully", claim },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating claim:", error);
    return NextResponse.json(
      { error: "Failed to submit claim request" },
      { status: 500 }
    );
  }
}
