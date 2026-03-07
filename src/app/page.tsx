import { prisma } from "@/lib/prisma";
import { Hero, LocationGrid, CartTypeCards, SEOContent } from "@/components/home";
import JsonLd from "@/components/seo/JsonLd";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch featured locations
  const featuredLocations = await prisma.location.findMany({
    where: { featured: true, active: true },
    orderBy: { city: "asc" },
  });

  // Get listing counts grouped by city+state
  const listingCounts = await prisma.listing.groupBy({
    by: ["city", "state"],
    where: { active: true },
    _count: { id: true },
  });

  // Merge counts into locations
  const locationsWithCounts = featuredLocations.map((location) => {
    const match = listingCounts.find(
      (lc) =>
        lc.city.toLowerCase() === location.city.toLowerCase() &&
        lc.state.toLowerCase() === location.state.toLowerCase()
    );
    return {
      ...location,
      listingCount: match?._count?.id ?? 0,
    };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GolfCartsForRentNearMe.com",
    url: "https://www.golfcartsforrentnearme.com",
    description:
      "Find the best golf cart rentals near you. Browse hundreds of rental companies across America.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://www.golfcartsforrentnearme.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero />
      <LocationGrid locations={locationsWithCounts} />
      <CartTypeCards />
      <SEOContent />
    </>
  );
}
