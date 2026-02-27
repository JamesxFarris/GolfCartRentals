export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function formatPrice(price: number | null | undefined): string {
  if (!price) return "Contact for pricing";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

export function stateAbbreviationToName(abbr: string): string {
  const states: Record<string, string> = {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
    CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
    HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
    KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
    MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
    MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
    NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
    ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
    RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
    TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
    WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
  };
  return states[abbr.toUpperCase()] || abbr;
}

export function stateNameToSlug(name: string): string {
  return slugify(name);
}

export function getCartTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    GAS: "Gas",
    ELECTRIC: "Electric",
    LSV: "Low-Speed Vehicle (LSV)",
  };
  return labels[type] || type;
}

export function getFeatureLabel(feature: string): string {
  const labels: Record<string, string> = {
    street_legal: "Street Legal",
    bluetooth: "Bluetooth Speakers",
    rain_enclosure: "Rain Enclosure",
    lights: "LED Lights",
    lift_kit: "Lift Kit",
    windshield: "Windshield",
    turn_signals: "Turn Signals",
    seat_belts: "Seat Belts",
    mirrors: "Side Mirrors",
    storage: "Storage Compartment",
    charger: "Charger Included",
    gps: "GPS Tracking",
    insurance: "Insurance Included",
    delivery: "Delivery Available",
    roadside: "Roadside Assistance",
  };
  return labels[feature] || feature.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export const CART_TYPES = ["GAS", "ELECTRIC", "LSV"] as const;
export const PASSENGER_OPTIONS = [2, 4, 6, 8] as const;
export const FEATURES = [
  "street_legal", "bluetooth", "rain_enclosure", "lights", "lift_kit",
  "windshield", "turn_signals", "seat_belts", "mirrors", "storage",
  "charger", "gps", "insurance", "delivery", "roadside",
] as const;
