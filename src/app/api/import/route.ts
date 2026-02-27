import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mapOutScraperRecord, OutScraperRecord } from "@/lib/import-mapper";
import { slugify } from "@/lib/utils";
import { parse } from "csv-parse/sync";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let records: OutScraperRecord[] = [];

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file uploaded" },
          { status: 400 }
        );
      }

      const text = await file.text();
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith(".csv")) {
        records = parse(text, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
      } else if (fileName.endsWith(".json")) {
        const parsed = JSON.parse(text);
        records = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        return NextResponse.json(
          { error: "Unsupported file format. Please upload CSV or JSON." },
          { status: 400 }
        );
      }
    } else {
      // Handle JSON body
      const body = await request.json();
      if (!body.records || !Array.isArray(body.records)) {
        return NextResponse.json(
          { error: "Request must include a records array" },
          { status: 400 }
        );
      }
      records = body.records;
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const record of records) {
      try {
        const mapped = mapOutScraperRecord(record);

        if (!mapped) {
          skipped++;
          continue;
        }

        // Upsert listing matched on name + city + state
        const existing = await prisma.listing.findFirst({
          where: {
            name: { equals: mapped.name, mode: "insensitive" },
            city: { equals: mapped.city, mode: "insensitive" },
            state: { equals: mapped.state, mode: "insensitive" },
          },
        });

        if (existing) {
          await prisma.listing.update({
            where: { id: existing.id },
            data: {
              description: mapped.description || existing.description,
              streetAddress: mapped.streetAddress || existing.streetAddress,
              zipCode: mapped.zipCode || existing.zipCode,
              latitude: mapped.latitude || existing.latitude,
              longitude: mapped.longitude || existing.longitude,
              phone: mapped.phone || existing.phone,
              website: mapped.website || existing.website,
              cartTypes:
                mapped.cartTypes.length > 0
                  ? mapped.cartTypes
                  : existing.cartTypes,
              features:
                mapped.features.length > 0
                  ? mapped.features
                  : existing.features,
              operatingHours:
                mapped.operatingHours || existing.operatingHours || undefined,
              photos:
                mapped.photos.length > 0 ? mapped.photos : existing.photos,
            },
          });
          updated++;
        } else {
          // Ensure unique slug
          let slug = mapped.slug;
          const slugExists = await prisma.listing.findUnique({
            where: { slug },
          });
          if (slugExists) {
            slug = `${slug}-${Date.now()}`;
          }

          await prisma.listing.create({
            data: {
              ...mapped,
              slug,
            },
          });
          created++;
        }

        // Auto-create Location if it doesn't exist
        const stateSlug = slugify(mapped.state);
        const citySlug = slugify(mapped.city);

        const locationExists = await prisma.location.findFirst({
          where: {
            stateSlug,
            citySlug,
          },
        });

        if (!locationExists) {
          await prisma.location.create({
            data: {
              city: mapped.city,
              state: mapped.state,
              stateSlug,
              citySlug,
              latitude: mapped.latitude || 0,
              longitude: mapped.longitude || 0,
            },
          });
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Unknown error";
        errors.push(
          `Error processing "${record.name || "unknown"}": ${errorMsg}`
        );
        skipped++;
      }
    }

    return NextResponse.json({
      created,
      updated,
      skipped,
      errors,
      total: records.length,
    });
  } catch (error) {
    console.error("Error importing data:", error);
    return NextResponse.json(
      { error: "Failed to import data" },
      { status: 500 }
    );
  }
}
