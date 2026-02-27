import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/layout";
import ClaimForm from "@/components/claim/ClaimForm";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { stateAbbreviationToName, slugify } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Claim Your Listing | GolfCartsForRentNearMe.com",
  description:
    "Claim your golf cart rental business listing on GolfCartsForRentNearMe.com to manage your information and connect with customers.",
};

interface ClaimPageProps {
  params: { listingId: string };
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.listingId },
  });

  if (!listing) {
    notFound();
  }

  const stateName = stateAbbreviationToName(listing.state);
  const stateSlug = slugify(stateName);
  const citySlug = slugify(listing.city);

  // If already claimed, show message
  if (listing.claimStatus === "CLAIMED") {
    return (
      <div className="container-page py-8">
        <Breadcrumbs
          items={[
            {
              label: listing.city,
              href: `/locations/${stateSlug}/${citySlug}`,
            },
            {
              label: listing.name,
              href: `/locations/${stateSlug}/${citySlug}/${listing.slug}`,
            },
            { label: "Claim Listing", href: `/claim/${listing.id}` },
          ]}
        />

        <div className="max-w-2xl mx-auto mt-8">
          <Card className="p-8 text-center">
            <svg
              className="mx-auto h-16 w-16 text-accent-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Listing Already Claimed
            </h1>
            <p className="text-slate-600 mb-6">
              <strong>{listing.name}</strong> has already been claimed and
              verified by its owner.
            </p>
            <Button
              variant="primary"
              href={`/locations/${stateSlug}/${citySlug}/${listing.slug}`}
            >
              View Listing
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // If claim pending
  if (listing.claimStatus === "PENDING") {
    return (
      <div className="container-page py-8">
        <Breadcrumbs
          items={[
            {
              label: listing.city,
              href: `/locations/${stateSlug}/${citySlug}`,
            },
            {
              label: listing.name,
              href: `/locations/${stateSlug}/${citySlug}/${listing.slug}`,
            },
            { label: "Claim Listing", href: `/claim/${listing.id}` },
          ]}
        />

        <div className="max-w-2xl mx-auto mt-8">
          <Card className="p-8 text-center">
            <svg
              className="mx-auto h-16 w-16 text-orange-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Claim Under Review
            </h1>
            <p className="text-slate-600 mb-6">
              A claim for <strong>{listing.name}</strong> is currently being
              reviewed by our team. Please check back soon.
            </p>
            <Button
              variant="primary"
              href={`/locations/${stateSlug}/${citySlug}/${listing.slug}`}
            >
              View Listing
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <Breadcrumbs
        items={[
          {
            label: listing.city,
            href: `/locations/${stateSlug}/${citySlug}`,
          },
          {
            label: listing.name,
            href: `/locations/${stateSlug}/${citySlug}/${listing.slug}`,
          },
          { label: "Claim Listing", href: `/claim/${listing.id}` },
        ]}
      />

      <div className="max-w-2xl mx-auto mt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Claim {listing.name}
          </h1>
          <p className="text-slate-600">
            Is this your business? Submit your information below and our team
            will verify your claim. Once verified, you will be able to manage
            your listing information and connect with potential customers.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <ClaimForm listingId={listing.id} listingName={listing.name} />
        </Card>

        <p className="mt-6 text-sm text-slate-500 text-center">
          Need help?{" "}
          <Link
            href="/contact"
            className="text-primary-700 hover:text-primary-800 font-medium"
          >
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}
