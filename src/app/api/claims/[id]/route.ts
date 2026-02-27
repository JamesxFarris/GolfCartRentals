import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["APPROVED", "DENIED"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be APPROVED or DENIED" },
        { status: 400 }
      );
    }

    const claim = await prisma.claimRequest.findUnique({
      where: { id: params.id },
      include: { listing: true },
    });

    if (!claim) {
      return NextResponse.json(
        { error: "Claim not found" },
        { status: 404 }
      );
    }

    const reviewerId = (session.user as { id: string }).id;

    if (status === "APPROVED") {
      // Find or create user from claim info
      let user = await prisma.user.findUnique({
        where: { email: claim.email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: claim.name,
            email: claim.email,
            phone: claim.phone,
            role: "USER",
          },
        });
      }

      // Update claim and listing in a transaction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedClaim = await prisma.$transaction(async (tx: any) => {
        const updated = await tx.claimRequest.update({
          where: { id: params.id },
          data: {
            status: "APPROVED",
            reviewedAt: new Date(),
            reviewedById: reviewerId,
          },
        });

        await tx.listing.update({
          where: { id: claim.listingId },
          data: {
            claimStatus: "CLAIMED",
            claimedById: user!.id,
          },
        });

        return updated;
      });

      return NextResponse.json(updatedClaim);
    } else {
      // DENIED
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedClaim = await prisma.$transaction(async (tx: any) => {
        const updated = await tx.claimRequest.update({
          where: { id: params.id },
          data: {
            status: "DENIED",
            reviewedAt: new Date(),
            reviewedById: reviewerId,
          },
        });

        await tx.listing.update({
          where: { id: claim.listingId },
          data: {
            claimStatus: "UNCLAIMED",
          },
        });

        return updated;
      });

      return NextResponse.json(updatedClaim);
    }
  } catch (error) {
    console.error("Error updating claim:", error);
    return NextResponse.json(
      { error: "Failed to update claim" },
      { status: 500 }
    );
  }
}
