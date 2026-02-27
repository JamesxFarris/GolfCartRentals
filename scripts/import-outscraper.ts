/**
 * OutScraper CSV/JSON Import Script
 *
 * Usage:
 *   npx tsx scripts/import-outscraper.ts <file-path>
 *
 * Supports CSV and JSON files exported from OutScraper.
 * Maps OutScraper fields to our Listing schema and upserts records.
 */

import { PrismaClient } from "@prisma/client";
import { mapOutScraperRecord, OutScraperRecord } from "../src/lib/import-mapper";
import { slugify, stateAbbreviationToName } from "../src/lib/utils";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

function readFile(filePath: string): OutScraperRecord[] {
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, "utf-8");

  if (ext === ".json") {
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [data];
  }

  if (ext === ".csv") {
    return parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  }

  throw new Error(`Unsupported file format: ${ext}. Use .csv or .json`);
}

async function ensureLocation(city: string, state: string, lat: number | null, lng: number | null) {
  const stateName = stateAbbreviationToName(state);
  const stateSlug = slugify(stateName);
  const citySlug = slugify(city);

  await prisma.location.upsert({
    where: { stateSlug_citySlug: { stateSlug, citySlug } },
    update: {},
    create: {
      city,
      state,
      stateSlug,
      citySlug,
      latitude: lat || 0,
      longitude: lng || 0,
      description: `Find golf cart rentals in ${city}, ${stateName}. Browse local rental companies, compare prices, and rent the perfect golf cart for your trip.`,
      metaTitle: `Golf Cart Rentals in ${city}, ${state} | GolfCartsForRentNearMe.com`,
      metaDescription: `Discover the best golf cart rental companies in ${city}, ${stateName}. Compare rates, cart types, and features to find your perfect rental.`,
    },
  });
}

async function importRecords(records: OutScraperRecord[]): Promise<ImportResult> {
  const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };

  for (const record of records) {
    try {
      const mapped = mapOutScraperRecord(record);
      if (!mapped) {
        result.skipped++;
        result.errors.push(`Skipped record: missing name or city/state - ${record.name || "unnamed"}`);
        continue;
      }

      await ensureLocation(mapped.city, mapped.state, mapped.latitude, mapped.longitude);

      // Check for existing listing by name + city + state
      const existing = await prisma.listing.findFirst({
        where: {
          name: mapped.name,
          city: mapped.city,
          state: mapped.state,
        },
      });

      // Ensure unique slug
      let slug = mapped.slug;
      const slugExists = await prisma.listing.findUnique({ where: { slug } });
      if (slugExists && (!existing || slugExists.id !== existing.id)) {
        slug = `${slug}-${mapped.city.toLowerCase().replace(/\s+/g, "-")}`;
        const slugExists2 = await prisma.listing.findUnique({ where: { slug } });
        if (slugExists2 && (!existing || slugExists2.id !== existing.id)) {
          slug = `${slug}-${Date.now()}`;
        }
      }

      if (existing) {
        await prisma.listing.update({
          where: { id: existing.id },
          data: {
            ...mapped,
            slug,
            // Don't overwrite claim status or claimed user
            claimStatus: undefined,
            // Don't remove existing data with null values
            description: mapped.description || existing.description,
            phone: mapped.phone || existing.phone,
            website: mapped.website || existing.website,
            photos: mapped.photos.length > 0 ? mapped.photos : existing.photos,
          },
        });
        result.updated++;
      } else {
        await prisma.listing.create({
          data: {
            ...mapped,
            slug,
          },
        });
        result.created++;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      result.errors.push(`Error importing "${record.name || "unnamed"}": ${msg}`);
      result.skipped++;
    }
  }

  return result;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npx tsx scripts/import-outscraper.ts <file-path>");
    console.error("Supported formats: .csv, .json");
    process.exit(1);
  }

  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }

  console.log(`Reading file: ${fullPath}`);
  const records = readFile(fullPath);
  console.log(`Found ${records.length} records`);

  console.log("Importing...");
  const result = await importRecords(records);

  console.log("\n--- Import Results ---");
  console.log(`Created: ${result.created}`);
  console.log(`Updated: ${result.updated}`);
  console.log(`Skipped: ${result.skipped}`);
  if (result.errors.length > 0) {
    console.log(`\nErrors (${result.errors.length}):`);
    result.errors.forEach((e) => console.log(`  - ${e}`));
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
