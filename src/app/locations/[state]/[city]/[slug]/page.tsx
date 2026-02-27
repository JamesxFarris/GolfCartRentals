import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/layout";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import GoogleMap from "@/components/maps/GoogleMap";
import ListingCard from "@/components/listings/ListingCard";
import JsonLd from "@/components/seo/JsonLd";
import {
  stateAbbreviationToName,
  formatPrice,
  formatPhone,
  getCartTypeLabel,
  getFeatureLabel,
} from "@/lib/utils";
import type { Listing } from "@/types";

export const dynamic = "force-dynamic";

interface ListingDetailPageProps {
  params: { state: string; city: string; slug: string };
}

export async function generateMetadata({
  params,
}: ListingDetailPageProps): Promise<Metadata> {
  const listing = await prisma.listing.findFirst({
    where: { slug: params.slug, active: true },
  });

  if (!listing) {
    return { title: "Listing Not Found | GolfCartsForRentNearMe.com" };
  }

  const stateName = stateAbbreviationToName(listing.state);

  return {
    title: `${listing.name} - Golf Cart Rentals in ${listing.city}, ${stateName}`,
    description:
      listing.metaDescription ||
      `Rent golf carts from ${listing.name} in ${listing.city}, ${stateName}. View pricing, hours, features, and contact information.`,
  };
}

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  const listing = await prisma.listing.findFirst({
    where: { slug: params.slug, active: true },
  });

  if (!listing) {
    notFound();
  }

  const stateName = stateAbbreviationToName(listing.state);

  // Fetch nearby listings
  const nearbyListings = await prisma.listing.findMany({
    where: {
      city: { equals: listing.city, mode: "insensitive" },
      state: { equals: listing.state, mode: "insensitive" },
      active: true,
      NOT: { id: listing.id },
    },
    take: 4,
    orderBy: { name: "asc" },
  });

  // Build Google Maps directions URL
  const addressParts = [
    listing.streetAddress,
    listing.city,
    listing.state,
    listing.zipCode,
  ].filter(Boolean);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    addressParts.join(", ")
  )}`;

  // Parse operating hours
  const operatingHours = listing.operatingHours as Record<string, string> | null;

  // JSON-LD LocalBusiness
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.name,
    description: listing.description || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.streetAddress || undefined,
      addressLocality: listing.city,
      addressRegion: listing.state,
      postalCode: listing.zipCode || undefined,
      addressCountry: "US",
    },
    geo:
      listing.latitude && listing.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: listing.latitude,
            longitude: listing.longitude,
          }
        : undefined,
    telephone: listing.phone || undefined,
    url: listing.website || undefined,
    openingHours: operatingHours
      ? Object.entries(operatingHours).map(
          ([day, hours]) => `${day} ${hours}`
        )
      : undefined,
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="container-page py-8">
        <Breadcrumbs
          items={[
            { label: "Locations", href: "/locations" },
            { label: stateName, href: `/locations/${params.state}` },
            {
              label: listing.city,
              href: `/locations/${params.state}/${params.city}`,
            },
            {
              label: listing.name,
              href: `/locations/${params.state}/${params.city}/${params.slug}`,
            },
          ]}
        />

        {/* Header */}
        <div className="mt-4 mb-8">
          <div className="flex flex-wrap items-start gap-3 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              {listing.name}
            </h1>
            {listing.claimStatus === "CLAIMED" && (
              <Badge variant="green">Verified Business</Badge>
            )}
            {listing.claimStatus === "PENDING" && (
              <Badge variant="orange">Claim Pending</Badge>
            )}
            {listing.claimStatus === "UNCLAIMED" && (
              <Badge variant="gray">Unclaimed</Badge>
            )}
          </div>
          <p className="text-slate-500 flex items-center gap-1">
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {listing.city}, {stateName}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              variant="accent"
              size="lg"
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Get Directions
            </Button>
            {listing.phone && (
              <Button
                variant="primary"
                size="lg"
                href={`tel:${listing.phone}`}
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Call {formatPhone(listing.phone)}
              </Button>
            )}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {listing.description && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  About {listing.name}
                </h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </Card>
            )}

            {/* Contact & Address Info */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Contact Information
              </h2>
              <dl className="space-y-4">
                {listing.streetAddress && (
                  <div className="flex items-start gap-3">
                    <dt className="text-slate-400 shrink-0">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </dt>
                    <dd className="text-slate-700">
                      {listing.streetAddress}
                      <br />
                      {listing.city}, {listing.state}{" "}
                      {listing.zipCode}
                    </dd>
                  </div>
                )}
                {listing.phone && (
                  <div className="flex items-center gap-3">
                    <dt className="text-slate-400 shrink-0">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </dt>
                    <dd>
                      <a
                        href={`tel:${listing.phone}`}
                        className="text-primary-700 hover:text-primary-800 font-medium"
                      >
                        {formatPhone(listing.phone)}
                      </a>
                    </dd>
                  </div>
                )}
                {listing.email && (
                  <div className="flex items-center gap-3">
                    <dt className="text-slate-400 shrink-0">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </dt>
                    <dd>
                      <a
                        href={`mailto:${listing.email}`}
                        className="text-primary-700 hover:text-primary-800 font-medium"
                      >
                        {listing.email}
                      </a>
                    </dd>
                  </div>
                )}
                {listing.website && (
                  <div className="flex items-center gap-3">
                    <dt className="text-slate-400 shrink-0">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                    </dt>
                    <dd>
                      <a
                        href={listing.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-700 hover:text-primary-800 font-medium"
                      >
                        Visit Website
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </Card>

            {/* Operating Hours */}
            {operatingHours && Object.keys(operatingHours).length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Operating Hours
                </h2>
                <table className="w-full">
                  <tbody>
                    {Object.entries(operatingHours).map(([day, hours]) => (
                      <tr
                        key={day}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-2.5 pr-4 font-medium text-slate-700 capitalize">
                          {day}
                        </td>
                        <td className="py-2.5 text-slate-600">{hours as string}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {/* Cart Details */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Cart Details
              </h2>

              {/* Cart Types */}
              {listing.cartTypes && listing.cartTypes.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-500 mb-2">
                    Cart Types
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.cartTypes.map((type) => (
                      <Badge
                        key={type}
                        variant={
                          type === "ELECTRIC"
                            ? "green"
                            : type === "GAS"
                            ? "orange"
                            : "blue"
                        }
                      >
                        {getCartTypeLabel(type)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Max Passengers */}
              {listing.maxPassengers && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-500 mb-1">
                    Max Passengers
                  </h3>
                  <p className="text-slate-700">
                    Up to {listing.maxPassengers} passengers
                  </p>
                </div>
              )}

              {/* Rental Radius */}
              {listing.rentalRadius && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-500 mb-1">
                    Rental Radius
                  </h3>
                  <p className="text-slate-700">{listing.rentalRadius}</p>
                </div>
              )}

              {/* Rates Table */}
              {(listing.rateHourly ||
                listing.rateDaily ||
                listing.rateWeekly ||
                listing.rateMonthly) && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-slate-500 mb-3">
                    Rental Rates
                  </h3>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-slate-700">
                          Period
                        </th>
                        <th className="text-right py-2 text-sm font-medium text-slate-700">
                          Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {listing.rateHourly && (
                        <tr className="border-b border-gray-100">
                          <td className="py-2.5 text-slate-600">Hourly</td>
                          <td className="py-2.5 text-right font-semibold text-slate-900">
                            {formatPrice(listing.rateHourly)}
                          </td>
                        </tr>
                      )}
                      {listing.rateDaily && (
                        <tr className="border-b border-gray-100">
                          <td className="py-2.5 text-slate-600">Daily</td>
                          <td className="py-2.5 text-right font-semibold text-slate-900">
                            {formatPrice(listing.rateDaily)}
                          </td>
                        </tr>
                      )}
                      {listing.rateWeekly && (
                        <tr className="border-b border-gray-100">
                          <td className="py-2.5 text-slate-600">Weekly</td>
                          <td className="py-2.5 text-right font-semibold text-slate-900">
                            {formatPrice(listing.rateWeekly)}
                          </td>
                        </tr>
                      )}
                      {listing.rateMonthly && (
                        <tr>
                          <td className="py-2.5 text-slate-600">Monthly</td>
                          <td className="py-2.5 text-right font-semibold text-slate-900">
                            {formatPrice(listing.rateMonthly)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Features */}
            {listing.features && listing.features.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Features
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {listing.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <svg
                        className="h-4 w-4 text-accent-600 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {getFeatureLabel(feature)}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Claim This Listing */}
            {listing.claimStatus === "UNCLAIMED" && (
              <Card className="p-6 bg-primary-50 border-primary-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  Is This Your Business?
                </h2>
                <p className="text-slate-600 mb-4">
                  Claim this listing to update your business information, respond
                  to inquiries, and manage your presence on
                  GolfCartsForRentNearMe.com.
                </p>
                <Button variant="primary" href={`/claim/${listing.id}`}>
                  Claim This Listing
                </Button>
              </Card>
            )}
          </div>

          {/* Right column - Map & Nearby */}
          <div className="space-y-8">
            {/* Map */}
            {listing.latitude && listing.longitude && (
              <GoogleMap
                latitude={listing.latitude}
                longitude={listing.longitude}
                name={listing.name}
              />
            )}

            {/* Nearby Listings */}
            {nearbyListings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Nearby Golf Cart Rentals
                </h2>
                <div className="space-y-4">
                  {nearbyListings.map((nearby) => (
                    <ListingCard
                      key={nearby.id}
                      listing={nearby as Listing}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
