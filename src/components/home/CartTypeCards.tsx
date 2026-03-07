import Link from "next/link";

const cartTypes = [
  {
    title: "Electric Golf Carts",
    tagline: "Quiet & Eco-Friendly",
    description:
      "Zero emissions and whisper-quiet. Perfect for resort communities, beach towns, and campgrounds.",
    href: "/search?type=ELECTRIC",
    color: "bg-emerald-600",
    hoverColor: "hover:bg-emerald-700",
    lightBg: "bg-emerald-50",
    textColor: "text-emerald-700",
    stat: "Most Popular",
  },
  {
    title: "Gas Golf Carts",
    tagline: "Power & Range",
    description:
      "Built for longer distances and tougher terrain. Ideal for large properties and all-day adventures.",
    href: "/search?type=GAS",
    color: "bg-amber-600",
    hoverColor: "hover:bg-amber-700",
    lightBg: "bg-amber-50",
    textColor: "text-amber-700",
    stat: "Extended Range",
  },
  {
    title: "Low-Speed Vehicles",
    tagline: "Street-Legal & Safe",
    description:
      "Fully equipped with safety features for public roads. Great for gated communities and short commutes.",
    href: "/search?type=LSV",
    color: "bg-blue-600",
    hoverColor: "hover:bg-blue-700",
    lightBg: "bg-blue-50",
    textColor: "text-blue-700",
    stat: "Street Legal",
  },
];

export default function CartTypeCards() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-accent-600 uppercase tracking-wider mb-2">
            Cart Types
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
            Choose Your Ride
          </h2>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
            From eco-friendly electrics to powerful gas carts and street-legal LSVs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {cartTypes.map((cart) => (
            <Link
              key={cart.title}
              href={cart.href}
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Top color band */}
              <div className={`h-2 ${cart.color}`} />

              <div className="p-6 sm:p-8">
                {/* Badge */}
                <span
                  className={`inline-block text-xs font-bold uppercase tracking-wider ${cart.textColor} ${cart.lightBg} px-3 py-1 rounded-full mb-4`}
                >
                  {cart.stat}
                </span>

                <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-700 transition-colors mb-1">
                  {cart.title}
                </h3>
                <p className="text-sm font-medium text-slate-500 mb-3">
                  {cart.tagline}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {cart.description}
                </p>

                {/* CTA */}
                <div
                  className={`mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white ${cart.color} ${cart.hoverColor} transition-colors`}
                >
                  Browse Rentals
                  <svg
                    className="h-4 w-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
