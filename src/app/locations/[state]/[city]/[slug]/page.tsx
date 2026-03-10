import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Breadcrumbs } from "@/components/layout";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import GoogleMap from "@/components/maps/GoogleMap";
import ListingCard from "@/components/listings/ListingCard";
import PhotoManager from "@/components/listings/PhotoManager";
import JsonLd from "@/components/seo/JsonLd";
import {
  slugify,
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
  const title =
    listing.metaTitle ||
    `${listing.name} - Golf Cart Rentals in ${listing.city}, ${stateName}`;
  const description =
    listing.metaDescription ||
    `Rent golf carts from ${listing.name} in ${listing.city}, ${stateName}. View pricing, hours, features, and contact information.`;
  const url = `https://golfcartsforrentnearme.com/locations/${slugify(stateName)}/${slugify(listing.city)}/${listing.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: listing.photos.length > 0 ? [{ url: listing.photos[0], width: 1200, height: 800, alt: listing.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: listing.photos.length > 0 ? [listing.photos[0]] : undefined,
    },
    alternates: {
      canonical: url,
    },
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

  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";
  const isOwner =
    listing.claimStatus === "CLAIMED" &&
    listing.claimedById === session?.user?.id;
  const canManagePhotos = isAdmin || isOwner;

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
  const operatingHours = listing.operatingHours as Record<
    string,
    string
  > | null;

  // Lowest rate for stats bar
  const rates = [
    listing.rateHourly,
    listing.rateDaily,
    listing.rateWeekly,
    listing.rateMonthly,
  ].filter((r): r is number => r !== null && r !== undefined);
  const lowestRate = rates.length > 0 ? Math.min(...rates) : null;

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
    image: listing.photos.length > 0 ? listing.photos[0] : undefined,
    openingHours: operatingHours
      ? Object.entries(operatingHours).map(
          ([day, hours]) => `${day} ${hours}`
        )
      : undefined,
  };

  const baseUrl = "https://golfcartsforrentnearme.com";
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Locations", item: `${baseUrl}/locations` },
      { "@type": "ListItem", position: 3, name: stateName, item: `${baseUrl}/locations/${params.state}` },
      { "@type": "ListItem", position: 4, name: listing.city, item: `${baseUrl}/locations/${params.state}/${params.city}` },
      { "@type": "ListItem", position: 5, name: listing.name, item: `${baseUrl}/locations/${params.state}/${params.city}/${params.slug}` },
    ],
  };

  const hasPhotos = listing.photos && listing.photos.length > 0;

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbLd} />

      {/* Hero Section */}
      <div className="relative">
        {hasPhotos ? (
          <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={listing.photos[0]}
              alt={listing.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ) : (
          <div className="relative h-48 sm:h-64 md:h-72 bg-primary-900 overflow-hidden">
            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-800 rounded-full -translate-y-1/2 translate-x-1/3 opacity-50" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-800 rounded-full translate-y-1/2 -translate-x-1/3 opacity-30" />
          </div>
        )}

        {/* Hero overlay content */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container-page pb-6 sm:pb-8">
            <div className="flex flex-wrap items-end gap-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                {listing.name}
              </h1>
              {listing.claimStatus === "CLAIMED" && (
                <Badge variant="green" className="!bg-green-500/90 !text-white mb-1">
                  Verified Business
                </Badge>
              )}
            </div>
            <p className="text-white/80 mt-1 flex items-center gap-1.5 text-sm sm:text-base">
              <svg
                className="h-4 w-4 shrink-0"
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
              {listing.zipCode && ` ${listing.zipCode}`}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container-page">
          <div className="flex items-center gap-6 py-3 overflow-x-auto text-sm">
            {listing.cartTypes && listing.cartTypes.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="flex gap-1.5">
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
            {listing.maxPassengers && (
              <div className="flex items-center gap-1.5 text-slate-600 shrink-0">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Up to {listing.maxPassengers} passengers</span>
              </div>
            )}
            {lowestRate && (
              <div className="flex items-center gap-1.5 shrink-0">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-slate-600">
                  Starting at{" "}
                  <span className="font-semibold text-slate-900">
                    {formatPrice(lowestRate)}
                  </span>
                </span>
              </div>
            )}
            {listing.features?.includes("delivery") && (
              <div className="flex items-center gap-1.5 text-accent-700 shrink-0">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Delivery Available</span>
              </div>
            )}
          </div>
        </div>
      </div>

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

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 mb-8">
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
            <Button variant="primary" size="lg" href={`tel:${listing.phone}`}>
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
          {listing.website && (
            <Button
              variant="secondary"
              size="lg"
              href={listing.website}
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
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              Visit Website
            </Button>
          )}
        </div>

        {/* Photo Gallery / Manager */}
        <PhotoManager
          listingId={listing.id}
          initialPhotos={listing.photos}
          name={listing.name}
          canManage={canManagePhotos}
        />

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
                      {listing.city}, {listing.state} {listing.zipCode}
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
                    {Object.entries(operatingHours).sort(([a], [b]) => {
                        const order = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
                        return order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase());
                      }).map(([day, hours]) => (
                      <tr
                        key={day}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-2.5 pr-4 font-medium text-slate-700 capitalize">
                          {day}
                        </td>
                        <td className="py-2.5 text-slate-600">
                          {hours as string}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {/* Rental Rates */}
            {(listing.rateHourly ||
              listing.rateDaily ||
              listing.rateWeekly ||
              listing.rateMonthly) && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Rental Rates
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {listing.rateHourly && (
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-slate-900">
                        {formatPrice(listing.rateHourly)}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">per hour</p>
                    </div>
                  )}
                  {listing.rateDaily && (
                    <div className="bg-primary-50 rounded-lg p-4 text-center ring-2 ring-primary-200">
                      <p className="text-2xl font-bold text-primary-900">
                        {formatPrice(listing.rateDaily)}
                      </p>
                      <p className="text-sm text-primary-600 mt-1 font-medium">
                        per day
                      </p>
                    </div>
                  )}
                  {listing.rateWeekly && (
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-slate-900">
                        {formatPrice(listing.rateWeekly)}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">per week</p>
                    </div>
                  )}
                  {listing.rateMonthly && (
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-slate-900">
                        {formatPrice(listing.rateMonthly)}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">per month</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Cart Details & Features */}
            {((listing.cartTypes && listing.cartTypes.length > 0) ||
              listing.maxPassengers ||
              listing.rentalRadius ||
              (listing.features && listing.features.length > 0)) && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Cart Details & Features
                </h2>

                <div className="space-y-5">
                  {/* Cart Types */}
                  {listing.cartTypes && listing.cartTypes.length > 0 && (
                    <div>
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

                  {/* Max Passengers & Rental Radius */}
                  <div className="flex flex-wrap gap-8">
                    {listing.maxPassengers && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1">
                          Max Passengers
                        </h3>
                        <p className="text-slate-700">
                          Up to {listing.maxPassengers} passengers
                        </p>
                      </div>
                    )}
                    {listing.rentalRadius && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1">
                          Rental Radius
                        </h3>
                        <p className="text-slate-700">{listing.rentalRadius}</p>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  {listing.features && listing.features.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-3">
                        Features
                      </h3>
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
                    </div>
                  )}
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
                  Claim this listing to update your business information, upload
                  photos, and manage your presence on
                  GolfCartsForRentNearMe.com.
                </p>
                <Button variant="primary" href={`/claim/${listing.id}`}>
                  Claim This Listing
                </Button>
              </Card>
            )}
          </div>

          {/* Right column - Sticky sidebar */}
          <div className="space-y-8">
            <div className="lg:sticky lg:top-6 space-y-8">
              {/* Quick Contact Card */}
              <Card className="p-5">
                <h3 className="font-semibold text-slate-900 mb-4">
                  Get in Touch
                </h3>
                <div className="space-y-3">
                  {listing.phone && (
                    <a
                      href={`tel:${listing.phone}`}
                      className="flex items-center gap-3 w-full px-4 py-3 bg-primary-700 hover:bg-primary-800 text-white rounded-lg transition-colors font-medium text-sm"
                    >
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {formatPhone(listing.phone)}
                    </a>
                  )}
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full px-4 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors font-medium text-sm"
                  >
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
                    Get Directions
                  </a>
                  {listing.website && (
                    <a
                      href={listing.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 w-full px-4 py-3 border border-gray-300 hover:bg-gray-50 text-slate-700 rounded-lg transition-colors font-medium text-sm"
                    >
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
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      Visit Website
                    </a>
                  )}
                </div>
              </Card>

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
                        compact
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
