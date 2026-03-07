import Link from "next/link";

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
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-accent-600 uppercase tracking-wider mb-2">
            Explore Destinations
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
            Golf Cart Rentals By City
          </h2>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
            Browse rental options in the most popular vacation spots
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {locations.map((location) => (
            <Link
              key={`${location.stateSlug}-${location.citySlug}`}
              href={`/locations/${location.stateSlug}/${location.citySlug}`}
              className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 p-5 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
            >
              {/* Accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors text-lg">
                    {location.city}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {location.state}
                  </p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-50 group-hover:bg-primary-100 transition-colors">
                  <svg
                    className="h-5 w-5 text-primary-600 group-hover:translate-x-0.5 transition-transform"
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
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-sm font-medium text-primary-700">
                  {location.listingCount}{" "}
                  {location.listingCount === 1 ? "rental company" : "rental companies"}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/locations"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors text-sm"
          >
            View All Locations
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
