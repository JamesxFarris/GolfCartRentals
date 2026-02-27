import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/layout";
import { stateAbbreviationToName } from "@/lib/utils";
import Card from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Golf Cart Rental Locations | GolfCartsForRentNearMe.com",
  description:
    "Browse golf cart rental locations across the United States. Find rental companies by state and city.",
};

export default async function LocationsPage() {
  // Fetch all active locations
  const locations = await prisma.location.findMany({
    where: { active: true },
    orderBy: [{ state: "asc" }, { city: "asc" }],
  });

  // Get listing counts per city+state
  const listingCounts = await prisma.listing.groupBy({
    by: ["city", "state"],
    where: { active: true },
    _count: { id: true },
  });

  // Group locations by state
  const locationsByState: Record<
    string,
    Array<{
      id: string;
      city: string;
      state: string;
      stateSlug: string;
      citySlug: string;
      listingCount: number;
    }>
  > = {};

  for (const location of locations) {
    const stateName = stateAbbreviationToName(location.state);
    if (!locationsByState[stateName]) {
      locationsByState[stateName] = [];
    }
    const match = listingCounts.find(
      (lc) =>
        lc.city.toLowerCase() === location.city.toLowerCase() &&
        lc.state.toLowerCase() === location.state.toLowerCase()
    );
    locationsByState[stateName].push({
      id: location.id,
      city: location.city,
      state: location.state,
      stateSlug: location.stateSlug,
      citySlug: location.citySlug,
      listingCount: match?._count?.id ?? 0,
    });
  }

  const sortedStates = Object.keys(locationsByState).sort();

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Browse Locations", href: "/locations" }]} />

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Browse Golf Cart Rental Locations
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          Find golf cart rental companies in cities and towns across the United
          States. Select a state to explore available rentals in your area.
        </p>
      </div>

      {/* State Pills */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Find Golf Cart Rentals by State
        </h2>
        <div className="flex flex-wrap gap-2">
          {sortedStates.map((stateName) => {
            const stateSlug = locationsByState[stateName][0]?.stateSlug;
            return (
              <Link
                key={stateName}
                href={`/locations/${stateSlug}`}
                className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 transition-colors"
              >
                {stateName}
              </Link>
            );
          })}
        </div>
      </div>

      {/* State Sections */}
      <div className="space-y-12">
        {sortedStates.map((stateName) => {
          const cities = locationsByState[stateName];
          const stateSlug = cities[0]?.stateSlug;
          return (
            <section key={stateName} id={stateSlug}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  {stateName}
                </h2>
                <Link
                  href={`/locations/${stateSlug}`}
                  className="text-sm font-medium text-primary-700 hover:text-primary-800 transition-colors"
                >
                  View all &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cities.map((city) => (
                  <Link
                    key={city.id}
                    href={`/locations/${city.stateSlug}/${city.citySlug}`}
                  >
                    <Card hover className="p-4">
                      <h3 className="font-semibold text-slate-900">
                        {city.city}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {city.listingCount}{" "}
                        {city.listingCount === 1 ? "rental" : "rentals"}
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
