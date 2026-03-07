import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  // Check auth: must be admin or the business owner who claimed this listing
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const isAdmin = session?.user?.role === "ADMIN";
  const isOwner =
    listing.claimStatus === "CLAIMED" &&
    listing.claimedById === session?.user?.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("photos") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 photos per upload" },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        continue;
      }

      // Max 10MB per file
      if (file.size > 10 * 1024 * 1024) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: `golfcart-rentals/${listing.slug}`,
                transformation: [
                  { width: 1200, height: 800, crop: "limit", quality: "auto" },
                ],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result as { secure_url: string });
              }
            )
            .end(buffer);
        }
      );

      uploadedUrls.push(result.secure_url);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: "No valid images uploaded" },
        { status: 400 }
      );
    }

    // Append new photos to existing ones
    const updatedListing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        photos: [...listing.photos, ...uploadedUrls],
      },
    });

    return NextResponse.json({
      photos: updatedListing.photos,
      added: uploadedUrls.length,
    });
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload photos" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const isAdmin = session?.user?.role === "ADMIN";
  const isOwner =
    listing.claimStatus === "CLAIMED" &&
    listing.claimedById === session?.user?.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { photoUrl } = await request.json();

    if (!photoUrl || !listing.photos.includes(photoUrl)) {
      return NextResponse.json({ error: "Photo not found" }, { status: 400 });
    }

    const updatedListing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        photos: listing.photos.filter((p) => p !== photoUrl),
      },
    });

    return NextResponse.json({ photos: updatedListing.photos });
  } catch (error) {
    console.error("Photo delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
