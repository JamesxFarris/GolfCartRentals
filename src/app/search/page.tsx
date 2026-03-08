import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/layout";
import SearchBar from "@/components/search/SearchBar";
import ListingGrid from "@/components/listings/ListingGrid";
import ListingFilters from "@/components/listings/ListingFilters";
import ActiveFilters from "@/components/search/ActiveFilters";
import type { Listing } from "@/types";
import { getZipCodeCoords, haversineDistance } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Search Golf Cart Rentals | GolfCartsForRentNearMe.com",
  description:
    "Search for golf cart rentals by location, type, and features. Find the perfect rental near you.",
};

interface SearchPageProps {
  searchParams: {
    q?: string;
    type?: string;
    passengers?: string;
    features?: string;
    page?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q?.trim() || "";
  const activeTypes = searchParams.type?.split(",").filter(Boolean) || [];
  const activePassengers = searchParams.passengers?.split(",").filter(Boolean) || [];
  const activeFeatures = searchParams.features?.split(",").filter(Boolean) || [];
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 12;

  const RADIUS_MILES = 100;
  const ZIP_REGEX = /^\d{5}$/;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { active: true };

  let zipCoords: { lat: number; lon: number; city: string; state: string } | null = null;

  if (query && ZIP_REGEX.test(query)) {
    zipCoords = await getZipCodeCoords(query);
  }

  if (zipCoords) {
    // Bounding box for 100-mile radius to narrow the DB query
    const latDelta = RADIUS_MILES / 69;
    const lonDelta = RADIUS_MILES / (69 * Math.cos((zipCoords.lat * Math.PI) / 180));
    where.latitude = { gte: zipCoords.lat - latDelta, lte: zipCoords.lat + latDelta };
    where.longitude = { gte: zipCoords.lon - lonDelta, lte: zipCoords.lon + lonDelta };
  } else if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { city: { contains: query, mode: "insensitive" } },
      { state: { contains: query, mode: "insensitive" } },
      { zipCode: { contains: query, mode: "insensitive" } },
    ];
  }

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

  let listings: Listing[];
  let totalCount: number;

  if (zipCoords) {
    // Fetch bounding box candidates then filter by exact Haversine distance
    const candidates = await prisma.listing.findMany({
      where,
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });
    const nearby = candidates.filter(
      (l) =>
        l.latitude != null &&
        l.longitude != null &&
        haversineDistance(zipCoords!.lat, zipCoords!.lon, l.latitude!, l.longitude!) <= RADIUS_MILES
    );
    totalCount = nearby.length;
    listings = nearby.slice((page - 1) * pageSize, page * pageSize) as Listing[];
  } else {
    [listings, totalCount] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: [{ featured: "desc" }, { name: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.listing.count({ where }),
    ]) as [Listing[], number];
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  // Popular location links for empty state
  const popularLocations = [
    { label: "Florida", href: "/locations/florida" },
    { label: "South Carolina", href: "/locations/south-carolina" },
    { label: "Texas", href: "/locations/texas" },
    { label: "California", href: "/locations/california" },
    { label: "Georgia", href: "/locations/georgia" },
    { label: "North Carolina", href: "/locations/north-carolina" },
  ];

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Search Results", href: "/search" }]} />

      {/* Search Bar */}
      <div className="max-w-2xl mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Search Golf Cart Rentals
        </h1>
        <Suspense fallback={null}>
          <SearchBar defaultValue={query} />
        </Suspense>
      </div>

      {/* Active Filters */}
      <div className="mb-6">
        <Suspense fallback={null}>
          <ActiveFilters />
        </Suspense>
      </div>

      {/* Result Count */}
      <p className="text-slate-600 mb-6 font-medium">
        {totalCount} Golf Cart {totalCount === 1 ? "Rental" : "Rentals"} Found
        {query && (
          <span className="text-slate-400">
            {" "}
            {zipCoords
              ? `within ${RADIUS_MILES} miles of ${zipCoords.city}, ${zipCoords.state} (${query})`
              : <>for &ldquo;{query}&rdquo;</>}
          </span>
        )}
      </p>

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
          {listings.length > 0 ? (
            <>
              <ListingGrid listings={listings as Listing[]} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={`/search?${new URLSearchParams({
                        ...(query && { q: query }),
                        ...(searchParams.type && { type: searchParams.type }),
                        ...(searchParams.passengers && {
                          passengers: searchParams.passengers,
                        }),
                        ...(searchParams.features && {
                          features: searchParams.features,
                        }),
                        page: String(page - 1),
                      }).toString()}`}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-slate-700 hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </Link>
                  )}
                  <span className="text-sm text-slate-600">
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages && (
                    <Link
                      href={`/search?${new URLSearchParams({
                        ...(query && { q: query }),
                        ...(searchParams.type && { type: searchParams.type }),
                        ...(searchParams.passengers && {
                          passengers: searchParams.passengers,
                        }),
                        ...(searchParams.features && {
                          features: searchParams.features,
                        }),
                        page: String(page + 1),
                      }).toString()}`}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-slate-700 hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <svg
                className="mx-auto h-16 w-16 text-slate-300 mb-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                No Rentals Found
              </h2>
              <p className="text-slate-500 max-w-md mx-auto mb-8">
                We could not find any golf cart rentals matching your search.
                Try a different location or adjust your filters.
              </p>
              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-3">
                  Popular Locations
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {popularLocations.map((location) => (
                    <Link
                      key={location.href}
                      href={location.href}
                      className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 transition-colors"
                    >
                      {location.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
