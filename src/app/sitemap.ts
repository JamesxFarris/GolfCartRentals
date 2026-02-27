import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { slugify, stateAbbreviationToName } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://golfcartsforrentnearme.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/locations`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const locations = await prisma.location.findMany({ where: { active: true } });

    const statePages: MetadataRoute.Sitemap = Array.from(
      new Set(locations.map((l) => l.stateSlug))
    ).map((stateSlug) => ({
      url: `${baseUrl}/locations/${stateSlug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const cityPages: MetadataRoute.Sitemap = locations.map((loc) => ({
      url: `${baseUrl}/locations/${loc.stateSlug}/${loc.citySlug}`,
      lastModified: loc.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const listings = await prisma.listing.findMany({
      where: { active: true },
      select: { slug: true, city: true, state: true, updatedAt: true },
    });

    const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
      url: `${baseUrl}/locations/${slugify(stateAbbreviationToName(listing.state))}/${slugify(listing.city)}/${listing.slug}`,
      lastModified: listing.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...statePages, ...cityPages, ...listingPages];
  } catch {
    return staticPages;
  }
}
