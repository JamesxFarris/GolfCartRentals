import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { slugify, formatPrice } from "@/lib/utils";
import type { Listing } from "@/types";

interface ListingCardProps {
  listing: Listing;
}

const cartTypeBadgeVariant: Record<string, "orange" | "green" | "blue"> = {
  GAS: "orange",
  ELECTRIC: "green",
  LSV: "blue",
};

export default function ListingCard({ listing }: ListingCardProps) {
  const stateSlug = slugify(listing.state);
  const citySlug = slugify(listing.city);
  const detailPath = `/locations/${stateSlug}/${citySlug}/${listing.slug}`;

  const hasPhotos = listing.photos && listing.photos.length > 0;
  const isUnclaimed = listing.claimStatus === "UNCLAIMED";

  return (
    <Card hover className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Photo section */}
        <Link
          href={detailPath}
          className="block relative w-full sm:w-56 md:w-64 shrink-0 h-48 sm:h-auto overflow-hidden"
        >
          {hasPhotos ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.photos[0]}
              alt={listing.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full min-h-[10rem] bg-gradient-to-br from-primary-100 via-primary-200 to-accent-100 flex items-center justify-center">
              <svg
                className="h-16 w-16 text-primary-300"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="4" y="12" width="20" height="10" rx="2" fill="currentColor" opacity="0.3" />
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

            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
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
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{listing.maxPassengers} passengers</span>
              </div>
            )}

            <Link
              href={detailPath}
              className="text-sm font-medium text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 rounded-lg px-5 py-2 transition-colors whitespace-nowrap"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
