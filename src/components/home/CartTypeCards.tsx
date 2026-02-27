import Link from "next/link";

const cartTypes = [
  {
    title: "Electric Golf Carts",
    description:
      "Eco-friendly and whisper-quiet, electric golf carts are perfect for resort communities, beach towns, and campgrounds. Enjoy zero emissions and smooth, reliable performance on every ride.",
    href: "/search?type=ELECTRIC",
    borderColor: "border-green-500",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: "Gas Golf Carts",
    description:
      "Built for power and extended range, gas golf carts handle longer distances and tougher terrain with ease. Ideal for large properties, hunting trips, and all-day adventures.",
    href: "/search?type=GAS",
    borderColor: "border-orange-500",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
        />
      </svg>
    ),
  },
  {
    title: "Low-Speed Vehicles",
    description:
      "Street-legal and fully equipped with safety features, LSVs are perfect for neighborhood transportation, gated communities, and short commutes on public roads.",
    href: "/search?type=LSV",
    borderColor: "border-blue-500",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
        />
      </svg>
    ),
  },
];

export default function CartTypeCards() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            What Type of Golf Cart Do You Need?
          </h2>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
            Choose from electric, gas, or street-legal low-speed vehicles to
            match your rental needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {cartTypes.map((cart) => (
            <Link
              key={cart.title}
              href={cart.href}
              className={`group bg-white rounded-xl border-t-4 ${cart.borderColor} shadow-sm hover:shadow-lg transition-all duration-300 p-6 sm:p-8 flex flex-col`}
            >
              <div
                className={`inline-flex items-center justify-center h-14 w-14 rounded-xl ${cart.iconBg} ${cart.iconColor} mb-5`}
              >
                {cart.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 group-hover:text-primary-700 transition-colors mb-3">
                {cart.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed flex-1">
                {cart.description}
              </p>
              <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-primary-700 group-hover:text-primary-800">
                Browse {cart.title}
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
