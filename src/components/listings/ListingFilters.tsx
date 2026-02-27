"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CART_TYPES, FEATURES, PASSENGER_OPTIONS, getCartTypeLabel, getFeatureLabel } from "@/lib/utils";

export default function ListingFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTypes = searchParams.get("type")?.split(",").filter(Boolean) || [];
  const activePassengers = searchParams.get("passengers")?.split(",").filter(Boolean) || [];
  const activeFeatures = searchParams.get("features")?.split(",").filter(Boolean) || [];

  const toggleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(",").filter(Boolean) || [];
    const isActive = current.includes(value);

    if (isActive) {
      const updated = current.filter((v) => v !== value);
      if (updated.length > 0) {
        params.set(key, updated.join(","));
      } else {
        params.delete(key);
      }
    } else {
      params.set(key, [...current, value].join(","));
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <aside className="w-full">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Filters</h3>

        {/* Cart Type */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Cart Type</h4>
          <div className="space-y-2">
            {CART_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeTypes.includes(type)}
                  onChange={() => toggleFilter("type", type)}
                  className="rounded border-gray-300 text-primary-700 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-600">{getCartTypeLabel(type)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Passengers */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Passengers</h4>
          <div className="space-y-2">
            {PASSENGER_OPTIONS.map((count) => (
              <label key={count} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activePassengers.includes(String(count))}
                  onChange={() => toggleFilter("passengers", String(count))}
                  className="rounded border-gray-300 text-primary-700 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-600">
                  {count === 8 ? "8+" : count} Passengers
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">Features</h4>
          <div className="space-y-2">
            {FEATURES.map((feature) => (
              <label key={feature} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeFeatures.includes(feature)}
                  onChange={() => toggleFilter("features", feature)}
                  className="rounded border-gray-300 text-primary-700 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-600">{getFeatureLabel(feature)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
