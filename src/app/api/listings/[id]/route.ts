import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        claims: {
          orderBy: { createdAt: "desc" },
        },
        claimedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

// Fields that business owners are allowed to edit
const OWNER_EDITABLE_FIELDS = [
  "name",
  "description",
  "streetAddress",
  "city",
  "state",
  "zipCode",
  "phone",
  "email",
  "website",
  "cartTypes",
  "maxPassengers",
  "rentalRadius",
  "rateHourly",
  "rateDaily",
  "rateWeekly",
  "rateMonthly",
  "features",
  "operatingHours",
];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN";

    // Check if user is the owner of this listing
    const existingListing = await prisma.listing.findUnique({
      where: { id: params.id },
    });

    if (!existingListing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const isOwner =
      existingListing.claimStatus === "CLAIMED" &&
      existingListing.claimedById === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // If owner (not admin), restrict to allowed fields
    let data = body;
    if (!isAdmin) {
      data = {};
      for (const field of OWNER_EDITABLE_FIELDS) {
        if (body[field] !== undefined) {
          data[field] = body[field];
        }
      }
    }

    const listing = await prisma.listing.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listing = await prisma.listing.update({
      where: { id: params.id },
      data: { active: false },
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}
