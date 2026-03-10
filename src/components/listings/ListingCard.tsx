import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { slugify, formatPrice } from "@/lib/utils";
import type { Listing } from "@/types";

interface ListingCardProps {
  listing: Listing;
  compact?: boolean;
}

const cartTypeBadgeVariant: Record<string, "orange" | "green" | "blue"> = {
  GAS: "orange",
  ELECTRIC: "green",
  LSV: "blue",
};

export default function ListingCard({ listing, compact = false }: ListingCardProps) {
  const stateSlug = slugify(listing.state);
  const citySlug = slugify(listing.city);
  const detailPath = `/locations/${stateSlug}/${citySlug}/${listing.slug}`;

  const hasPhotos = listing.photos && listing.photos.length > 0;

  if (compact) {
    return (
      <Link href={detailPath} className="group block">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-200">
          {/* Thumbnail */}
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-primary-50">
            {hasPhotos ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.photos[0]}
                alt={listing.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary-300">
                <svg className="h-7 w-7" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M6 22V14a2 2 0 012-2h14a2 2 0 012 2v2l2 2v4h-2m-16 0H6m0 0a2 2 0 104 0H6zm16 0a2 2 0 104 0h-4z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 group-hover:text-primary-700 transition-colors truncate">
              {listing.name}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {listing.city}, {listing.state}
            </p>
            {listing.rateDaily ? (
              <p className="text-xs mt-1">
                <span className="font-semibold text-slate-900">
                  {formatPrice(listing.rateDaily)}
                </span>
                <span className="text-slate-400">/day</span>
              </p>
            ) : null}
          </div>

          {/* Arrow */}
          <svg
            className="h-4 w-4 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    );
  }

  const isUnclaimed = listing.claimStatus === "UNCLAIMED";

  return (
    <Card hover className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Photo section */}
        <Link
          href={detailPath}
          className="block relative w-full sm:w-56 md:w-64 shrink-0 h-48 overflow-hidden"
        >
          {hasPhotos ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.photos[0]}
              alt={listing.name}
              className="block w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full min-h-[10rem] bg-primary-800 flex items-center justify-center">
              <svg
                className="h-16 w-16 text-primary-400 opacity-40"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 22V14a2 2 0 012-2h14a2 2 0 012 2v2l2 2v4h-2m-16 0H6m0 0a2 2 0 104 0H6zm16 0a2 2 0 104 0h-4z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
          {isUnclaimed && (
            <div className="absolute top-2 right-2 sm:right-auto sm:left-2">
              <Badge variant="orange">Claim This Listing</Badge>
            </div>
          )}
        </Link>

        {/* Content section */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:gap-6">
          {/* Main info */}
          <div className="flex-1 min-w-0">
            <Link
              href={detailPath}
              className="text-lg font-bold text-slate-900 hover:text-primary-700 transition-colors line-clamp-1"
            >
              {listing.name}
            </Link>

            <p className="text-sm text-slate-500 mt-1">
              {listing.city}, {listing.state}
            </p>

            {listing.cartTypes && listing.cartTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {listing.cartTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={cartTypeBadgeVariant[type] || "gray"}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            )}

            {listing.description && (
              <p className="text-sm text-slate-500 mt-2 line-clamp-2 hidden md:block">
                {listing.description}
              </p>
            )}
          </div>

          {/* Right side — pricing, passengers, CTA */}
          <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0">
            {listing.rateDaily ? (
              <p className="text-sm whitespace-nowrap">
                <span className="font-semibold text-lg text-slate-900">
                  {formatPrice(listing.rateDaily)}
                </span>
                <span className="text-slate-500"> /day</span>
              </p>
            ) : (
              <p className="text-sm text-slate-500">Contact for pricing</p>
            )}

            {listing.maxPassengers && (
              <p className="text-sm text-slate-500">
                {listing.maxPassengers} passengers
              </p>
            )}

            <Link
              href={detailPath}
              className="text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 rounded-lg px-5 py-2 transition-colors whitespace-nowrap"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
