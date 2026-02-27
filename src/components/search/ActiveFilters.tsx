"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Badge from "@/components/ui/Badge";
import { getCartTypeLabel, getFeatureLabel } from "@/lib/utils";

export default function ActiveFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTypes = searchParams.get("type")?.split(",").filter(Boolean) || [];
  const activePassengers = searchParams.get("passengers")?.split(",").filter(Boolean) || [];
  const activeFeatures = searchParams.get("features")?.split(",").filter(Boolean) || [];
  const query = searchParams.get("q") || "";

  const hasFilters =
    activeTypes.length > 0 ||
    activePassengers.length > 0 ||
    activeFeatures.length > 0;

  if (!hasFilters) return null;

  const removeFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(",").filter(Boolean) || [];
    const updated = current.filter((v) => v !== value);
    if (updated.length > 0) {
      params.set(key, updated.join(","));
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    if (query) {
      params.set("q", query);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-slate-600">Active filters:</span>

      {activeTypes.map((type) => (
        <Badge key={`type-${type}`} variant="blue">
          {getCartTypeLabel(type)}
          <button
            type="button"
            onClick={() => removeFilter("type", type)}
            className="ml-1.5 hover:text-blue-600 transition-colors"
            aria-label={`Remove ${getCartTypeLabel(type)} filter`}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </Badge>
      ))}

      {activePassengers.map((p) => (
        <Badge key={`pass-${p}`} variant="green">
          {p === "8" ? "8+" : p} Passengers
          <button
            type="button"
            onClick={() => removeFilter("passengers", p)}
            className="ml-1.5 hover:text-green-600 transition-colors"
            aria-label={`Remove ${p} passengers filter`}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </Badge>
      ))}

      {activeFeatures.map((feature) => (
        <Badge key={`feat-${feature}`} variant="orange">
          {getFeatureLabel(feature)}
          <button
            type="button"
            onClick={() => removeFilter("features", feature)}
            className="ml-1.5 hover:text-orange-600 transition-colors"
            aria-label={`Remove ${getFeatureLabel(feature)} filter`}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </Badge>
      ))}

      <button
        type="button"
        onClick={clearAll}
        className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors ml-2"
      >
        Clear All
      </button>
    </div>
  );
}
