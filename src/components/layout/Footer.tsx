import Link from "next/link";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Locations", href: "/locations" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const popularLocations = [
  { label: "The Villages, FL", href: "/locations/florida/the-villages" },
  { label: "Myrtle Beach, SC", href: "/locations/south-carolina/myrtle-beach" },
  { label: "Destin, FL", href: "/locations/florida/destin" },
  { label: "Hilton Head Island, SC", href: "/locations/south-carolina/hilton-head-island" },
  { label: "Gulf Shores, AL", href: "/locations/alabama/gulf-shores" },
  { label: "Put-in-Bay, OH", href: "/locations/ohio/put-in-bay" },
];

const browseByState = [
  { label: "Florida", href: "/locations/florida" },
  { label: "South Carolina", href: "/locations/south-carolina" },
  { label: "Georgia", href: "/locations/georgia" },
  { label: "Alabama", href: "/locations/alabama" },
  { label: "Texas", href: "/locations/texas" },
  { label: "California", href: "/locations/california" },
  { label: "North Carolina", href: "/locations/north-carolina" },
  { label: "Ohio", href: "/locations/ohio" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Logo + Description */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <svg
                className="h-7 w-7 text-primary-400"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="4" y="12" width="20" height="10" rx="2" fill="currentColor" opacity="0.2" />
                <path
                  d="M6 22V14a2 2 0 012-2h14a2 2 0 012 2v2l2 2v4h-2m-16 0H6m0 0a2 2 0 104 0H6zm16 0a2 2 0 104 0h-4z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 12V8a2 2 0 012-2h0a2 2 0 012 2v4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-lg font-bold text-white">
                GolfCarts<span className="text-primary-400">ForRent</span>NearMe
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Find the best golf cart rentals in your area. Browse hundreds of
              rental companies across America&apos;s top vacation destinations.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Popular Locations */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Popular Locations
            </h3>
            <ul className="space-y-2">
              {popularLocations.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Browse by State */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Browse by State
            </h3>
            <ul className="space-y-2">
              {browseByState.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              &copy; 2024 GolfCartsForRentNearMe.com. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
