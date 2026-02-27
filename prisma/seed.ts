import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const STATE_NAMES: Record<string, string> = {
  FL: "florida",
  SC: "south-carolina",
  GA: "georgia",
  AL: "alabama",
  OH: "ohio",
  TX: "texas",
  CA: "california",
  NC: "north-carolina",
};

// ---------------------------------------------------------------------------
// Location data
// ---------------------------------------------------------------------------

interface LocationSeed {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  description: string;
  featured: boolean;
}

const locations: LocationSeed[] = [
  {
    city: "The Villages",
    state: "FL",
    latitude: 28.9024,
    longitude: -81.9876,
    description:
      "The Villages is one of the largest golf cart communities in the world, with over 100 miles of dedicated cart paths. Renting a golf cart here is the best way to explore shops, restaurants, and recreation centers. Whether you're visiting friends or vacationing, a golf cart rental makes getting around effortless.",
    featured: true,
  },
  {
    city: "Myrtle Beach",
    state: "SC",
    latitude: 33.6891,
    longitude: -78.8867,
    description:
      "Myrtle Beach is a premier vacation destination where golf cart rentals are a popular way to cruise along the coast. Enjoy the ocean breeze as you ride between beachfront hotels, seafood restaurants, and amusement parks. Many rental companies offer street-legal carts perfect for short trips around town.",
    featured: true,
  },
  {
    city: "Destin",
    state: "FL",
    latitude: 30.3935,
    longitude: -86.4958,
    description:
      "Destin's emerald coast waters and white sand beaches make it a top Florida vacation spot. Golf cart rentals are ideal for navigating the harbor boardwalk, shopping plazas, and beachside dining. Rent by the hour or the week to make the most of your Destin getaway.",
    featured: true,
  },
  {
    city: "Peachtree City",
    state: "GA",
    latitude: 33.3968,
    longitude: -84.5963,
    description:
      "Peachtree City boasts over 100 miles of multi-use paths designed specifically for golf carts, making it one of America's most golf-cart-friendly cities. Residents and visitors alike use carts for everything from grocery runs to school drop-offs. Renting a golf cart here is the quintessential local experience.",
    featured: true,
  },
  {
    city: "Hilton Head Island",
    state: "SC",
    latitude: 32.2163,
    longitude: -80.7526,
    description:
      "Hilton Head Island's lush landscapes and world-class resorts make golf cart rentals a must-have for any visit. Navigate the island's bike-friendly paths, gated communities, and charming Harbour Town with ease. Electric and gas carts are available for daily, weekly, and monthly rentals.",
    featured: true,
  },
  {
    city: "Gulf Shores",
    state: "AL",
    latitude: 30.246,
    longitude: -87.7008,
    description:
      "Gulf Shores and neighboring Orange Beach offer stunning Gulf Coast scenery best explored by golf cart. Many local roads allow street-legal golf carts, giving you easy access to beaches, restaurants, and souvenir shops. Renting a cart is a fun and affordable alternative to a traditional car rental.",
    featured: true,
  },
  {
    city: "Put-in-Bay",
    state: "OH",
    latitude: 41.6528,
    longitude: -82.8204,
    description:
      "Put-in-Bay on South Bass Island is Ohio's favorite island getaway, and golf carts are the primary mode of transportation. Cars are scarce on the island, so renting a golf cart is practically essential for exploring wineries, caves, and waterfront attractions. Reserve early during peak summer season.",
    featured: true,
  },
  {
    city: "Galveston",
    state: "TX",
    latitude: 29.3013,
    longitude: -94.7977,
    description:
      "Galveston Island's historic Strand District and scenic Seawall Boulevard are best enjoyed at golf cart speed. Many areas of the island permit street-legal golf carts, making rentals a convenient way to sightsee. From beach days to evening dining on the pier, a golf cart adds charm to your Galveston trip.",
    featured: true,
  },
  {
    city: "Panama City Beach",
    state: "FL",
    latitude: 30.1766,
    longitude: -85.8055,
    description:
      "Panama City Beach is a spring break and family vacation hotspot where golf cart rentals add to the laid-back beach vibe. Cruise Front Beach Road to hit the best seafood joints, mini-golf courses, and souvenir shops. Affordable hourly and daily rates make it easy to enjoy the ride.",
    featured: false,
  },
  {
    city: "Miami Beach",
    state: "FL",
    latitude: 25.7907,
    longitude: -80.13,
    description:
      "Miami Beach's Art Deco District and vibrant Ocean Drive are a blast to explore by golf cart. LSV-class carts are street-legal on many local roads, offering a stylish alternative to rideshares. Rent an electric cart and cruise South Beach in true Miami fashion.",
    featured: false,
  },
  {
    city: "Sanibel Island",
    state: "FL",
    latitude: 26.45,
    longitude: -82.1014,
    description:
      "Sanibel Island's laid-back atmosphere and shell-lined beaches are perfectly suited for golf cart exploration. Navigate the island's shared-use paths past wildlife refuges, art galleries, and seafood shacks. A golf cart rental is the ideal way to slow down and soak in island life.",
    featured: false,
  },
  {
    city: "Catalina Island",
    state: "CA",
    latitude: 33.3428,
    longitude: -118.3276,
    description:
      "Catalina Island off the Southern California coast restricts automobile use, making golf carts one of the few ways to get around. Rent a cart in Avalon to explore the hillside streets, scenic overlooks, and waterfront shops. It's a uniquely charming way to experience this island paradise.",
    featured: false,
  },
  {
    city: "Key West",
    state: "FL",
    latitude: 24.5551,
    longitude: -81.78,
    description:
      "Key West's compact layout and tropical charm make golf cart rentals incredibly popular with visitors. Zip past colorful Victorian homes, lively Duval Street bars, and stunning sunset spots at Mallory Square. Most rental companies deliver carts right to your hotel or vacation rental.",
    featured: false,
  },
  {
    city: "Jekyll Island",
    state: "GA",
    latitude: 31.0758,
    longitude: -81.4167,
    description:
      "Jekyll Island is a Georgia barrier island where golf carts are the preferred way to tour historic landmarks, pristine beaches, and live oak forests. The island's flat terrain and dedicated paths make cart driving safe and enjoyable for all ages. Rentals are available year-round at affordable rates.",
    featured: false,
  },
  {
    city: "Outer Banks",
    state: "NC",
    latitude: 35.9582,
    longitude: -75.6201,
    description:
      "The Outer Banks of North Carolina offers miles of barrier island scenery that's perfect for leisurely golf cart rides. Many rental communities and beach villages permit cart traffic on local streets. Rent a cart to explore lighthouses, seafood shacks, and wild horse viewing areas.",
    featured: false,
  },
  {
    city: "Anna Maria Island",
    state: "FL",
    latitude: 27.531,
    longitude: -82.7326,
    description:
      "Anna Maria Island is a charming Old Florida destination where golf carts are the transportation of choice. Cruise Pine Avenue's boutiques and cafes or head to the city pier for sunset views. Street-legal rentals make it easy to explore the entire seven-mile island without a car.",
    featured: false,
  },
  {
    city: "Bald Head Island",
    state: "NC",
    latitude: 33.8588,
    longitude: -78.0062,
    description:
      "Bald Head Island is a car-free community accessible only by ferry, where golf carts and bicycles are the sole means of transportation. Renting a cart is essential for hauling luggage, groceries, and beach gear. Explore maritime forests, the historic lighthouse, and pristine shoreline at your own pace.",
    featured: false,
  },
  {
    city: "Palm Desert",
    state: "CA",
    latitude: 33.7222,
    longitude: -116.3745,
    description:
      "Palm Desert in the Coachella Valley embraces golf cart culture with cart-friendly lanes and paths connecting resorts, golf courses, and El Paseo shopping. The sunny desert climate makes open-air cart rides pleasant almost year-round. Rent a stylish cart to cruise this upscale desert oasis.",
    featured: false,
  },
  {
    city: "Pinehurst",
    state: "NC",
    latitude: 35.1955,
    longitude: -79.4695,
    description:
      "Pinehurst is legendary for its world-class golf courses, and golf cart rentals extend the fun beyond the fairway. The charming Village of Pinehurst allows carts on many local roads, making them perfect for dinner outings and shopping trips. Experience the home of American golf from behind the wheel of a cart.",
    featured: false,
  },
  {
    city: "Clearwater Beach",
    state: "FL",
    latitude: 27.9789,
    longitude: -82.8268,
    description:
      "Clearwater Beach consistently ranks among America's best beaches, and golf cart rentals offer a breezy way to enjoy it all. Ride along the beachfront to Pier 60, visit the Clearwater Marine Aquarium, or grab fresh grouper at a waterfront grill. Hourly and daily rentals fit any vacation schedule.",
    featured: false,
  },
];

// ---------------------------------------------------------------------------
// Listing data
// ---------------------------------------------------------------------------

interface ListingSeed {
  name: string;
  slug: string;
  description: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string;
  cartTypes: string[];
  maxPassengers: number;
  rateHourly: number;
  rateDaily: number;
  rateWeekly: number;
  rateMonthly: number;
  features: string[];
  operatingHours: Record<string, string>;
  rentalRadius: string;
}

const listings: ListingSeed[] = [
  {
    name: "Island Cruiser Rentals",
    slug: "island-cruiser-rentals-the-villages-fl",
    description:
      "Island Cruiser Rentals is The Villages' premier golf cart rental company, offering a wide fleet of electric and gas carts for visitors and seasonal residents. We provide free delivery anywhere within The Villages community and surrounding areas. All carts come fully charged, clean, and inspected for your safety and comfort.",
    streetAddress: "1250 Main St",
    city: "The Villages",
    state: "FL",
    zipCode: "32162",
    latitude: 28.9055,
    longitude: -81.9845,
    phone: "(352) 555-0142",
    email: "info@islandcruiserrentals.com",
    website: "https://www.islandcruiserrentals.com",
    cartTypes: ["ELECTRIC", "GAS"],
    maxPassengers: 4,
    rateHourly: 25,
    rateDaily: 75,
    rateWeekly: 350,
    rateMonthly: 1200,
    features: [
      "street_legal",
      "bluetooth",
      "rain_enclosure",
      "lights",
      "windshield",
      "delivery",
      "insurance",
    ],
    operatingHours: {
      monday: "8:00 AM - 6:00 PM",
      tuesday: "8:00 AM - 6:00 PM",
      wednesday: "8:00 AM - 6:00 PM",
      thursday: "8:00 AM - 6:00 PM",
      friday: "8:00 AM - 7:00 PM",
      saturday: "9:00 AM - 5:00 PM",
      sunday: "10:00 AM - 4:00 PM",
    },
    rentalRadius: "10 miles",
  },
  {
    name: "Beach Buggy Golf Carts",
    slug: "beach-buggy-golf-carts-myrtle-beach-sc",
    description:
      "Beach Buggy Golf Carts has been serving Myrtle Beach vacationers since 2015 with top-quality street-legal golf cart rentals. Our fleet includes 4, 6, and 8-passenger carts perfect for families and groups. We offer convenient pickup at your hotel, resort, or vacation rental anywhere along the Grand Strand.",
    streetAddress: "4821 N Kings Hwy",
    city: "Myrtle Beach",
    state: "SC",
    zipCode: "29577",
    latitude: 33.7103,
    longitude: -78.8723,
    phone: "(843) 555-0287",
    email: "rentals@beachbuggycarts.com",
    website: "https://www.beachbuggycarts.com",
    cartTypes: ["ELECTRIC", "LSV"],
    maxPassengers: 6,
    rateHourly: 30,
    rateDaily: 89,
    rateWeekly: 399,
    rateMonthly: 1400,
    features: [
      "street_legal",
      "bluetooth",
      "lights",
      "windshield",
      "turn_signals",
      "seat_belts",
      "delivery",
      "insurance",
    ],
    operatingHours: {
      monday: "7:00 AM - 8:00 PM",
      tuesday: "7:00 AM - 8:00 PM",
      wednesday: "7:00 AM - 8:00 PM",
      thursday: "7:00 AM - 8:00 PM",
      friday: "7:00 AM - 9:00 PM",
      saturday: "7:00 AM - 9:00 PM",
      sunday: "8:00 AM - 6:00 PM",
    },
    rentalRadius: "15 miles",
  },
  {
    name: "Coastal Cart Co.",
    slug: "coastal-cart-co-destin-fl",
    description:
      "Coastal Cart Co. is Destin's trusted source for premium golf cart rentals along the Emerald Coast. We specialize in lifted, street-legal carts with Bluetooth speakers and LED lighting for cruising the harbor in style. Our carts are meticulously maintained and come with complimentary roadside assistance.",
    streetAddress: "654 Harbor Blvd",
    city: "Destin",
    state: "FL",
    zipCode: "32541",
    latitude: 30.3932,
    longitude: -86.4716,
    phone: "(850) 555-0319",
    email: "hello@coastalcartco.com",
    website: "https://www.coastalcartco.com",
    cartTypes: ["GAS", "ELECTRIC", "LSV"],
    maxPassengers: 4,
    rateHourly: 35,
    rateDaily: 99,
    rateWeekly: 449,
    rateMonthly: 1500,
    features: [
      "street_legal",
      "bluetooth",
      "lights",
      "lift_kit",
      "windshield",
      "turn_signals",
      "seat_belts",
      "delivery",
    ],
    operatingHours: {
      monday: "8:00 AM - 7:00 PM",
      tuesday: "8:00 AM - 7:00 PM",
      wednesday: "8:00 AM - 7:00 PM",
      thursday: "8:00 AM - 7:00 PM",
      friday: "8:00 AM - 8:00 PM",
      saturday: "8:00 AM - 8:00 PM",
      sunday: "9:00 AM - 5:00 PM",
    },
    rentalRadius: "10 miles",
  },
  {
    name: "Peachtree Cart Rentals",
    slug: "peachtree-cart-rentals-peachtree-city-ga",
    description:
      "Peachtree Cart Rentals knows the path system of Peachtree City better than anyone. We offer affordable daily and weekly rentals of 2 and 4-passenger electric carts ideal for navigating the city's 100+ miles of cart paths. Whether you're relocating, visiting family, or just exploring, we have the perfect cart for you.",
    streetAddress: "302 Commerce Dr",
    city: "Peachtree City",
    state: "GA",
    zipCode: "30269",
    latitude: 33.3971,
    longitude: -84.5958,
    phone: "(770) 555-0456",
    email: "reserve@peachtreecartrentals.com",
    website: "https://www.peachtreecartrentals.com",
    cartTypes: ["ELECTRIC"],
    maxPassengers: 4,
    rateHourly: 20,
    rateDaily: 65,
    rateWeekly: 299,
    rateMonthly: 999,
    features: [
      "street_legal",
      "rain_enclosure",
      "lights",
      "windshield",
      "turn_signals",
      "seat_belts",
      "insurance",
    ],
    operatingHours: {
      monday: "8:00 AM - 6:00 PM",
      tuesday: "8:00 AM - 6:00 PM",
      wednesday: "8:00 AM - 6:00 PM",
      thursday: "8:00 AM - 6:00 PM",
      friday: "8:00 AM - 6:00 PM",
      saturday: "9:00 AM - 4:00 PM",
      sunday: "Closed",
    },
    rentalRadius: "5 miles",
  },
  {
    name: "Lowcountry Cart Rides",
    slug: "lowcountry-cart-rides-hilton-head-sc",
    description:
      "Lowcountry Cart Rides offers luxury golf cart rentals on beautiful Hilton Head Island. Our fleet features 6 and 8-passenger LSVs with premium seating, rain enclosures, and Bluetooth audio. We deliver to all major resorts, plantations, and vacation rentals across the island with flexible pickup and drop-off times.",
    streetAddress: "18 Palmetto Bay Rd",
    city: "Hilton Head Island",
    state: "SC",
    zipCode: "29928",
    latitude: 32.1854,
    longitude: -80.7381,
    phone: "(843) 555-0578",
    email: "book@lowcountrycartrides.com",
    website: "https://www.lowcountrycartrides.com",
    cartTypes: ["ELECTRIC", "LSV"],
    maxPassengers: 8,
    rateHourly: 40,
    rateDaily: 110,
    rateWeekly: 499,
    rateMonthly: 1600,
    features: [
      "street_legal",
      "bluetooth",
      "rain_enclosure",
      "lights",
      "windshield",
      "turn_signals",
      "seat_belts",
      "delivery",
      "insurance",
    ],
    operatingHours: {
      monday: "7:00 AM - 7:00 PM",
      tuesday: "7:00 AM - 7:00 PM",
      wednesday: "7:00 AM - 7:00 PM",
      thursday: "7:00 AM - 7:00 PM",
      friday: "7:00 AM - 8:00 PM",
      saturday: "7:00 AM - 8:00 PM",
      sunday: "8:00 AM - 5:00 PM",
    },
    rentalRadius: "10 miles",
  },
  {
    name: "Gulf Coast Cart Company",
    slug: "gulf-coast-cart-company-gulf-shores-al",
    description:
      "Gulf Coast Cart Company is Gulf Shores' locally owned and operated golf cart rental service. We carry gas and electric carts at competitive prices, with free delivery from Fort Morgan to Orange Beach. Every rental includes a full tank or charge, a safety briefing, and a local tips guide to help you explore the coast.",
    streetAddress: "3710 Gulf Shores Pkwy",
    city: "Gulf Shores",
    state: "AL",
    zipCode: "36542",
    latitude: 30.2477,
    longitude: -87.7009,
    phone: "(251) 555-0634",
    email: "rent@gulfcoastcartco.com",
    website: "https://www.gulfcoastcartco.com",
    cartTypes: ["GAS", "ELECTRIC"],
    maxPassengers: 6,
    rateHourly: 25,
    rateDaily: 79,
    rateWeekly: 375,
    rateMonthly: 1250,
    features: [
      "street_legal",
      "lights",
      "lift_kit",
      "windshield",
      "turn_signals",
      "delivery",
    ],
    operatingHours: {
      monday: "8:00 AM - 6:00 PM",
      tuesday: "8:00 AM - 6:00 PM",
      wednesday: "8:00 AM - 6:00 PM",
      thursday: "8:00 AM - 6:00 PM",
      friday: "8:00 AM - 7:00 PM",
      saturday: "8:00 AM - 7:00 PM",
      sunday: "9:00 AM - 5:00 PM",
    },
    rentalRadius: "12 miles",
  },
  {
    name: "Bay Island Cart Rentals",
    slug: "bay-island-cart-rentals-put-in-bay-oh",
    description:
      "Bay Island Cart Rentals is the top-rated golf cart rental provider on Put-in-Bay's South Bass Island. Since cars are limited on the island, our carts are the best way to see Perry's Victory Monument, the wineries, and the downtown strip. We offer 2, 4, and 6-seat carts right at the ferry dock for maximum convenience.",
    streetAddress: "240 Delaware Ave",
    city: "Put-in-Bay",
    state: "OH",
    zipCode: "43456",
    latitude: 41.6531,
    longitude: -82.8192,
    phone: "(419) 555-0721",
    email: "reservations@bayislandcarts.com",
    website: "https://www.bayislandcarts.com",
    cartTypes: ["GAS", "ELECTRIC"],
    maxPassengers: 6,
    rateHourly: 30,
    rateDaily: 85,
    rateWeekly: 0,
    rateMonthly: 0,
    features: [
      "rain_enclosure",
      "lights",
      "windshield",
      "seat_belts",
    ],
    operatingHours: {
      monday: "9:00 AM - 7:00 PM",
      tuesday: "9:00 AM - 7:00 PM",
      wednesday: "9:00 AM - 7:00 PM",
      thursday: "9:00 AM - 7:00 PM",
      friday: "9:00 AM - 9:00 PM",
      saturday: "9:00 AM - 9:00 PM",
      sunday: "9:00 AM - 6:00 PM",
    },
    rentalRadius: "Island-wide",
  },
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function main() {
  console.log("Seeding database...\n");

  // ---- Admin user ----
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@golfcartsforrentnearme.com" },
    update: {
      name: "Admin",
      role: "ADMIN",
      passwordHash,
    },
    create: {
      name: "Admin",
      email: "admin@golfcartsforrentnearme.com",
      role: "ADMIN",
      passwordHash,
    },
  });
  console.log(`Admin user upserted: ${adminUser.email}`);

  // ---- Locations ----
  let locationCount = 0;
  for (const loc of locations) {
    const stateSlug = STATE_NAMES[loc.state] ?? slugify(loc.state);
    const citySlug = slugify(loc.city);

    await prisma.location.upsert({
      where: {
        stateSlug_citySlug: { stateSlug, citySlug },
      },
      update: {
        city: loc.city,
        state: loc.state,
        latitude: loc.latitude,
        longitude: loc.longitude,
        description: loc.description,
        metaTitle: `Golf Cart Rentals in ${loc.city}, ${loc.state} | GolfCartsForRentNearMe.com`,
        metaDescription: `Find the best golf cart rentals in ${loc.city}, ${loc.state}. Compare prices, read reviews, and book street-legal golf carts for hourly, daily, or weekly rental near you.`,
        featured: loc.featured,
        active: true,
      },
      create: {
        city: loc.city,
        state: loc.state,
        stateSlug,
        citySlug,
        latitude: loc.latitude,
        longitude: loc.longitude,
        description: loc.description,
        metaTitle: `Golf Cart Rentals in ${loc.city}, ${loc.state} | GolfCartsForRentNearMe.com`,
        metaDescription: `Find the best golf cart rentals in ${loc.city}, ${loc.state}. Compare prices, read reviews, and book street-legal golf carts for hourly, daily, or weekly rental near you.`,
        featured: loc.featured,
        active: true,
      },
    });
    locationCount++;
  }
  console.log(`Locations upserted: ${locationCount}`);

  // ---- Listings ----
  let listingCount = 0;
  for (const listing of listings) {
    await prisma.listing.upsert({
      where: { slug: listing.slug },
      update: {
        name: listing.name,
        description: listing.description,
        streetAddress: listing.streetAddress,
        city: listing.city,
        state: listing.state,
        zipCode: listing.zipCode,
        latitude: listing.latitude,
        longitude: listing.longitude,
        phone: listing.phone,
        email: listing.email,
        website: listing.website,
        cartTypes: listing.cartTypes,
        maxPassengers: listing.maxPassengers,
        rateHourly: listing.rateHourly,
        rateDaily: listing.rateDaily,
        rateWeekly: listing.rateWeekly || null,
        rateMonthly: listing.rateMonthly || null,
        features: listing.features,
        operatingHours: listing.operatingHours,
        rentalRadius: listing.rentalRadius,
        metaTitle: `${listing.name} - Golf Cart Rentals in ${listing.city}, ${listing.state}`,
        metaDescription: `Rent golf carts from ${listing.name} in ${listing.city}, ${listing.state}. Offering ${listing.cartTypes.join(", ").toLowerCase()} carts for up to ${listing.maxPassengers} passengers. Book online today!`,
        claimStatus: "UNCLAIMED",
        active: true,
      },
      create: {
        name: listing.name,
        slug: listing.slug,
        description: listing.description,
        streetAddress: listing.streetAddress,
        city: listing.city,
        state: listing.state,
        zipCode: listing.zipCode,
        latitude: listing.latitude,
        longitude: listing.longitude,
        phone: listing.phone,
        email: listing.email,
        website: listing.website,
        cartTypes: listing.cartTypes,
        maxPassengers: listing.maxPassengers,
        rateHourly: listing.rateHourly,
        rateDaily: listing.rateDaily,
        rateWeekly: listing.rateWeekly || null,
        rateMonthly: listing.rateMonthly || null,
        features: listing.features,
        operatingHours: listing.operatingHours,
        rentalRadius: listing.rentalRadius,
        metaTitle: `${listing.name} - Golf Cart Rentals in ${listing.city}, ${listing.state}`,
        metaDescription: `Rent golf carts from ${listing.name} in ${listing.city}, ${listing.state}. Offering ${listing.cartTypes.join(", ").toLowerCase()} carts for up to ${listing.maxPassengers} passengers. Book online today!`,
        claimStatus: "UNCLAIMED",
        active: true,
      },
    });
    listingCount++;
  }
  console.log(`Listings upserted: ${listingCount}`);

  // ---- Summary ----
  const totalUsers = await prisma.user.count();
  const totalLocations = await prisma.location.count();
  const totalListings = await prisma.listing.count();

  console.log("\n--- Seed Summary ---");
  console.log(`Users:     ${totalUsers}`);
  console.log(`Locations: ${totalLocations}`);
  console.log(`Listings:  ${totalListings}`);
  console.log("--------------------\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
