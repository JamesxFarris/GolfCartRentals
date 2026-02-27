import { slugify } from "./utils";

export interface OutScraperRecord {
  name?: string;
  full_address?: string;
  street?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  zipCode?: string;
  latitude?: number | string;
  longitude?: number | string;
  phone?: string;
  site?: string;
  website?: string;
  description?: string;
  working_hours?: string | Record<string, string>;
  photos?: string | string[];
  type?: string;
  category?: string;
  rating?: number | string;
  reviews?: number | string;
}

export interface MappedListing {
  name: string;
  slug: string;
  description: string | null;
  streetAddress: string | null;
  city: string;
  state: string;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  cartTypes: string[];
  features: string[];
  operatingHours: Record<string, string> | undefined;
  photos: string[];
}

function parseAddress(fullAddress: string): {
  street: string | null;
  city: string;
  state: string;
  zip: string | null;
} {
  const parts = fullAddress.split(",").map((p) => p.trim());
  if (parts.length >= 3) {
    const stateZip = parts[parts.length - 1].split(" ").filter(Boolean);
    const state = stateZip[0] || "";
    const zip = stateZip[1] || null;
    return {
      street: parts.slice(0, parts.length - 2).join(", ") || null,
      city: parts[parts.length - 2],
      state,
      zip,
    };
  }
  return { street: null, city: parts[0] || "Unknown", state: "Unknown", zip: null };
}

function inferCartTypes(record: OutScraperRecord): string[] {
  const types: string[] = [];
  const text = `${record.name || ""} ${record.description || ""} ${record.type || ""} ${record.category || ""}`.toLowerCase();

  if (text.includes("electric") || text.includes("ev") || text.includes("e-cart")) {
    types.push("ELECTRIC");
  }
  if (text.includes("gas") || text.includes("gasoline")) {
    types.push("GAS");
  }
  if (text.includes("lsv") || text.includes("low speed") || text.includes("low-speed") || text.includes("street legal")) {
    types.push("LSV");
  }
  if (types.length === 0) {
    types.push("ELECTRIC", "GAS");
  }
  return types;
}

function parseWorkingHours(hours: string | Record<string, string> | undefined): Record<string, string> | undefined {
  if (!hours) return undefined;
  if (typeof hours === "object") return hours;
  try {
    return JSON.parse(hours);
  } catch {
    return undefined;
  }
}

function parsePhotos(photos: string | string[] | undefined): string[] {
  if (!photos) return [];
  if (Array.isArray(photos)) return photos;
  try {
    const parsed = JSON.parse(photos);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return photos.split(",").map((p) => p.trim()).filter(Boolean);
  }
}

export function mapOutScraperRecord(record: OutScraperRecord): MappedListing | null {
  if (!record.name) return null;

  let city = record.city || "";
  let state = record.state || "";
  let street = record.street || null;
  let zip = record.zip_code || record.zipCode || null;

  if (record.full_address && (!city || !state)) {
    const parsed = parseAddress(record.full_address);
    city = city || parsed.city;
    state = state || parsed.state;
    street = street || parsed.street;
    zip = zip || parsed.zip;
  }

  if (!city || !state) return null;

  return {
    name: record.name,
    slug: slugify(record.name),
    description: record.description || null,
    streetAddress: street,
    city,
    state,
    zipCode: zip,
    latitude: record.latitude ? Number(record.latitude) : null,
    longitude: record.longitude ? Number(record.longitude) : null,
    phone: record.phone || null,
    email: null,
    website: record.site || record.website || null,
    cartTypes: inferCartTypes(record),
    features: [],
    operatingHours: parseWorkingHours(record.working_hours),
    photos: parsePhotos(record.photos),
  };
}
