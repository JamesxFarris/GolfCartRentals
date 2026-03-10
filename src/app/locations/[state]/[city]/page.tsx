import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/layout";
import ListingGrid from "@/components/listings/ListingGrid";
import ListingFilters from "@/components/listings/ListingFilters";
import ActiveFilters from "@/components/search/ActiveFilters";
import JsonLd from "@/components/seo/JsonLd";
import { stateAbbreviationToName } from "@/lib/utils";
import type { Listing } from "@/types";

interface CityPageProps {
  params: { state: string; city: string };
  searchParams: { type?: string; passengers?: string; features?: string };
}

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const location = await prisma.location.findFirst({
    where: { stateSlug: params.state, citySlug: params.city, active: true },
  });

  if (!location) {
    return { title: "Location Not Found | GolfCartsForRentNearMe.com" };
  }

  const stateName = stateAbbreviationToName(location.state);

  const title = `Golf Cart Rentals in ${location.city}, ${stateName}`;
  const description =
    location.metaDescription ||
    `Find golf cart rentals in ${location.city}, ${stateName}. Compare prices, read reviews, and book your golf cart rental today.`;
  const url = `https://golfcartsforrentnearme.com/locations/${params.state}/${params.city}`;

  return {
    title,
    description,
    openGraph: { title, description, url },
    alternates: { canonical: url },
  };
}

export default async function CityPage({ params, searchParams }: CityPageProps) {
  const location = await prisma.location.findFirst({
    where: { stateSlug: params.state, citySlug: params.city, active: true },
  });

  if (!location) {
    notFound();
  }

  const stateName = stateAbbreviationToName(location.state);

  // Build listing filters
  const activeTypes = searchParams.type?.split(",").filter(Boolean) || [];
  const activePassengers = searchParams.passengers?.split(",").filter(Boolean) || [];
  const activeFeatures = searchParams.features?.split(",").filter(Boolean) || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    city: { equals: location.city, mode: "insensitive" },
    state: { equals: location.state, mode: "insensitive" },
    active: true,
  };

  if (activeTypes.length > 0) {
    where.cartTypes = { hasSome: activeTypes };
  }

  if (activePassengers.length > 0) {
    const passengerValues = activePassengers.map(Number).filter((n) => !isNaN(n));
    if (passengerValues.length > 0) {
      where.maxPassengers = { gte: Math.min(...passengerValues) };
    }
  }

  if (activeFeatures.length > 0) {
    where.features = { hasEvery: activeFeatures };
  }

  const listings = await prisma.listing.findMany({
    where,
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  // Get nearby cities in the same state
  const nearbyCities = await prisma.location.findMany({
    where: {
      stateSlug: params.state,
      active: true,
      NOT: { citySlug: params.city },
    },
    take: 6,
    orderBy: { city: "asc" },
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.golfcartsforrentnearme.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Locations",
        item: "https://www.golfcartsforrentnearme.com/locations",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: stateName,
        item: `https://www.golfcartsforrentnearme.com/locations/${params.state}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: location.city,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-800 text-white">
        <div className="container-page py-10">
          <Breadcrumbs
            items={[
              { label: "Locations", href: "/locations" },
              { label: stateName, href: `/locations/${params.state}` },
              {
                label: location.city,
                href: `/locations/${params.state}/${params.city}`,
              },
            ]}
          />
          <h1 className="text-3xl md:text-4xl font-bold mt-2">
            Golf Cart Rentals in {location.city}, {stateName}
          </h1>
          <p className="text-primary-100 mt-2 text-lg">
            {listings.length} {listings.length === 1 ? "rental" : "rentals"}{" "}
            available
          </p>
        </div>
      </div>

      <div className="container-page py-8">
        {/* Active filter chips */}
        <div className="mb-6">
          <Suspense fallback={null}>
            <ActiveFilters />
          </Suspense>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left sidebar - Filters */}
          <div className="lg:w-72 shrink-0">
            <Suspense fallback={null}>
              <ListingFilters />
            </Suspense>
          </div>

          {/* Right - Results */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {listings.length}{" "}
                {listings.length === 1
                  ? "Golf Cart Rental"
                  : "Golf Cart Rentals"}{" "}
                in {location.city}
              </h2>
            </div>
            <ListingGrid listings={listings as Listing[]} />
          </div>
        </div>

        {/* Nearby Golf Cart Rentals */}
        {nearbyCities.length > 0 && (
          <section className="mt-16 pt-10 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Nearby Golf Cart Rentals
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {nearbyCities.map((city) => (
                <Link
                  key={city.id}
                  href={`/locations/${city.stateSlug}/${city.citySlug}`}
                  className="block p-4 rounded-lg bg-slate-50 hover:bg-primary-50 text-center transition-colors"
                >
                  <span className="font-medium text-slate-900 text-sm">
                    {city.city}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SEO description */}
        {location.description && (
          <section className="mt-12 pt-8 border-t border-gray-200">
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed">
                {location.description}
              </p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
