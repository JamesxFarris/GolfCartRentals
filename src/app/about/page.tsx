import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about GolfCartsForRentNearMe.com, the leading directory for golf cart rental businesses across the United States.",
  alternates: { canonical: "https://golfcartsforrentnearme.com/about" },
};

export default function AboutPage() {
  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "About", href: "/about" }]} />

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto mt-4">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
          About GolfCartsForRentNearMe.com
        </h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            GolfCartsForRentNearMe.com is the premier online directory dedicated
            to connecting people with golf cart rental businesses across the
            United States. We make it easy to find, compare, and contact golf
            cart rental companies in your area.
          </p>

          {/* Mission Section */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Our Mission
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Our mission is to simplify the process of finding golf cart rentals.
              Whether you are planning a beach vacation, exploring a resort
              community, attending a special event, or simply need convenient
              transportation around town, we help you quickly locate the best
              rental options near you. We believe everyone deserves easy access to
              affordable, fun, and eco-friendly transportation.
            </p>
          </Card>

          {/* What We Do Section */}
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            What We Do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="h-12 w-12 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-primary-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Comprehensive Listings
              </h3>
              <p className="text-sm text-slate-600">
                We maintain the largest directory of golf cart rental businesses
                across hundreds of cities and towns nationwide.
              </p>
            </Card>

            <Card className="p-6">
              <div className="h-12 w-12 rounded-lg bg-accent-50 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-accent-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Verified Information
              </h3>
              <p className="text-sm text-slate-600">
                Business owners can claim and verify their listings to ensure
                accurate pricing, hours, and contact information.
              </p>
            </Card>

            <Card className="p-6">
              <div className="h-12 w-12 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-primary-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Smart Filtering
              </h3>
              <p className="text-sm text-slate-600">
                Filter by cart type, passenger capacity, features, and pricing
                to find the perfect rental for your needs.
              </p>
            </Card>
          </div>

          {/* Target Markets */}
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Who We Serve
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Golf cart rentals are popular across a wide range of markets and
            destinations. Our directory serves:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              "Beach and coastal communities",
              "Resort and vacation destinations",
              "Retirement and 55+ communities",
              "Gated neighborhoods and HOAs",
              "Island communities",
              "Large campgrounds and RV parks",
              "Golf course communities",
              "Event and festival venues",
            ].map((market) => (
              <div
                key={market}
                className="flex items-center gap-3 text-slate-700"
              >
                <svg
                  className="h-5 w-5 text-accent-600 shrink-0"
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
                {market}
              </div>
            ))}
          </div>

          {/* CTA for Businesses */}
          <Card className="p-8 bg-gradient-to-r from-primary-700 to-primary-800 text-white">
            <h2 className="text-2xl font-bold mb-3">
              Are You a Golf Cart Rental Business?
            </h2>
            <p className="text-primary-100 mb-6 max-w-2xl">
              Get found by thousands of customers searching for golf cart rentals
              in your area. Claim your free listing today to update your business
              information, showcase your fleet, and connect with renters.
            </p>
            <Button variant="accent" size="lg" href="/how-it-works">
              Learn How to Claim Your Listing
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
