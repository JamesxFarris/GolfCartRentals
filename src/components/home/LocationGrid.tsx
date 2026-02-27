import Link from "next/link";
import Card from "@/components/ui/Card";

interface LocationItem {
  city: string;
  state: string;
  stateSlug: string;
  citySlug: string;
  listingCount: number;
}

interface LocationGridProps {
  locations: LocationItem[];
}

export default function LocationGrid({ locations }: LocationGridProps) {
  if (locations.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Find Golf Cart Rentals By City
          </h2>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
            Explore golf cart rental options in popular vacation destinations
            across the country.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {locations.map((location) => (
            <Link
              key={`${location.stateSlug}-${location.citySlug}`}
              href={`/locations/${location.stateSlug}/${location.citySlug}`}
            >
              <Card hover className="p-5 h-full group">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">
                      {location.city}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {location.state}
                    </p>
                  </div>
                  <svg
                    className="h-5 w-5 text-slate-300 group-hover:text-primary-500 transition-colors shrink-0 mt-0.5"
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
                <div className="mt-3 flex items-center gap-1.5">
                  <svg
                    className="h-4 w-4 text-accent-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span className="text-sm text-slate-600">
                    {location.listingCount}{" "}
                    {location.listingCount === 1 ? "rental" : "rentals"}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
