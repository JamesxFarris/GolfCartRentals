import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/layout";
import { stateAbbreviationToName } from "@/lib/utils";
import Card from "@/components/ui/Card";

export const dynamic = "force-dynamic";

interface StatePageProps {
  params: { state: string };
}

export async function generateMetadata({
  params,
}: StatePageProps): Promise<Metadata> {
  const locations = await prisma.location.findMany({
    where: { stateSlug: params.state, active: true },
    take: 1,
  });

  if (locations.length === 0) {
    return { title: "State Not Found | GolfCartsForRentNearMe.com" };
  }

  const stateName = stateAbbreviationToName(locations[0].state);

  return {
    title: `Golf Cart Rentals in ${stateName} | GolfCartsForRentNearMe.com`,
    description: `Browse golf cart rental companies in ${stateName}. Compare prices, features, and availability across multiple cities.`,
  };
}

export async function generateStaticParams() {
  try {
    const locations = await prisma.location.findMany({
      where: { active: true },
      select: { stateSlug: true },
      distinct: ["stateSlug"],
    });

    return locations.map((location) => ({
      state: location.stateSlug,
    }));
  } catch {
    return [];
  }
}

export default async function StatePage({ params }: StatePageProps) {
  const locations = await prisma.location.findMany({
    where: { stateSlug: params.state, active: true },
    orderBy: { city: "asc" },
  });

  if (locations.length === 0) {
    notFound();
  }

  const stateName = stateAbbreviationToName(locations[0].state);

  // Get listing counts
  const listingCounts = await prisma.listing.groupBy({
    by: ["city", "state"],
    where: {
      active: true,
      state: locations[0].state,
    },
    _count: { id: true },
  });

  const citiesWithCounts = locations.map((location) => {
    const match = listingCounts.find(
      (lc) => lc.city.toLowerCase() === location.city.toLowerCase()
    );
    return {
      ...location,
      listingCount: match?._count?.id ?? 0,
    };
  });

  return (
    <div className="container-page py-8">
      <Breadcrumbs
        items={[
          { label: "Locations", href: "/locations" },
          { label: stateName, href: `/locations/${params.state}` },
        ]}
      />

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Golf Cart Rentals in {stateName}
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          Explore golf cart rental companies across {stateName}. Browse by city
          to find the best rental options near you, including electric, gas, and
          street-legal low-speed vehicles.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {citiesWithCounts.map((city) => (
          <Link
            key={city.id}
            href={`/locations/${city.stateSlug}/${city.citySlug}`}
          >
            <Card hover className="p-6 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {city.city}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">{stateName}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-accent-50 px-2.5 py-1 text-xs font-medium text-accent-700">
                  {city.listingCount}{" "}
                  {city.listingCount === 1 ? "rental" : "rentals"}
                </span>
              </div>
              <div className="mt-4 flex items-center text-primary-700 text-sm font-medium">
                View rentals
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
