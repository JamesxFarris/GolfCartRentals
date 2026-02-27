import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "How It Works | GolfCartsForRentNearMe.com",
  description:
    "Learn how GolfCartsForRentNearMe.com works for both renters and golf cart rental businesses. Find rentals or claim your listing today.",
};

export default function HowItWorksPage() {
  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "How It Works", href: "/how-it-works" }]} />

      <div className="max-w-4xl mx-auto mt-4">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
          How It Works
        </h1>
        <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto mb-16">
          Whether you are looking to rent a golf cart or you own a rental
          business, we make the process simple.
        </p>

        {/* For Renters */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <span className="inline-flex items-center rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-700 mb-4">
              For Renters
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Find Your Perfect Golf Cart Rental
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="p-6 text-center relative">
              <div className="h-14 w-14 rounded-full bg-primary-700 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Search by Location
              </h3>
              <p className="text-sm text-slate-600">
                Enter your destination city or browse our directory of locations
                across the country to find rental companies near you.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-primary-700 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Compare Options
              </h3>
              <p className="text-sm text-slate-600">
                Use our filters to narrow results by cart type, passenger
                capacity, features, and price. View detailed listings with
                hours, rates, and photos.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-primary-700 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Contact & Rent
              </h3>
              <p className="text-sm text-slate-600">
                Call, email, or visit the rental company directly to check
                availability and book your golf cart. Get directions to their
                location instantly.
              </p>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button variant="primary" size="lg" href="/locations">
              Browse Locations
            </Button>
          </div>
        </section>

        {/* For Businesses */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <span className="inline-flex items-center rounded-full bg-accent-50 px-4 py-1.5 text-sm font-semibold text-accent-700 mb-4">
              For Businesses
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Claim and Manage Your Listing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-accent-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Find Your Listing
              </h3>
              <p className="text-sm text-slate-600">
                Search our directory to find your existing business listing. If
                your business is not listed yet, contact us and we will add it.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-accent-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Submit Your Claim
              </h3>
              <p className="text-sm text-slate-600">
                Click &ldquo;Claim This Listing&rdquo; on your business page and
                fill out the verification form with your name, email, phone, and
                a brief message.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-accent-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Get Verified
              </h3>
              <p className="text-sm text-slate-600">
                Our team will review your claim and verify your ownership. Once
                approved, you can update your listing information, pricing, and
                business details.
              </p>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button variant="accent" size="lg" href="/search">
              Find Your Business
            </Button>
          </div>
        </section>

        {/* FAQ-like Benefits */}
        <section className="bg-slate-50 rounded-2xl p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Benefits of Claiming Your Listing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: "Accurate Information",
                description:
                  "Ensure your business details, hours, and pricing are always up to date.",
              },
              {
                title: "Increased Visibility",
                description:
                  "Verified listings rank higher in our directory, helping more customers find you.",
              },
              {
                title: "Customer Trust",
                description:
                  "A verified badge signals to customers that your business is legitimate and active.",
              },
              {
                title: "Free to Claim",
                description:
                  "There is no cost to claim your listing. It is completely free for business owners.",
              },
            ].map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-3">
                <svg
                  className="h-6 w-6 text-accent-600 shrink-0 mt-0.5"
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
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
