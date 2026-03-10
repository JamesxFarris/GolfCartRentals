import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the GolfCartsForRentNearMe.com team. We are here to help with questions about listings, claiming your business, or general inquiries.",
  alternates: { canonical: "https://golfcartsforrentnearme.com/contact" },
};

export default function ContactPage() {
  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Contact", href: "/contact" }]} />

      <div className="max-w-4xl mx-auto mt-4">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Contact Us
        </h1>
        <p className="text-lg text-slate-600 mb-10">
          Have a question or need help? We would love to hear from you. Fill out
          the form below and our team will get back to you as soon as possible.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 sm:p-8">
              <form className="space-y-5">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="Your name"
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-200 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-200 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={6}
                    required
                    placeholder="How can we help you?"
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-200 transition-colors duration-200"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary-700 hover:bg-primary-800 text-white focus:ring-primary-500 px-6 py-3 text-base w-full sm:w-auto"
                >
                  Send Message
                </button>
              </form>
            </Card>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <svg
                    className="h-5 w-5 text-primary-700"
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
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                  <p className="text-sm text-slate-600">
                    info@golfcartsforrentnearme.com
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent-50 flex items-center justify-center shrink-0">
                  <svg
                    className="h-5 w-5 text-accent-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Response Time
                  </h3>
                  <p className="text-sm text-slate-600">
                    We typically respond within 1-2 business days.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <svg
                    className="h-5 w-5 text-primary-700"
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
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Business Inquiries
                  </h3>
                  <p className="text-sm text-slate-600">
                    Want to claim or update a listing? Visit our{" "}
                    <a
                      href="/how-it-works"
                      className="text-primary-700 hover:text-primary-800 font-medium"
                    >
                      How It Works
                    </a>{" "}
                    page.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
