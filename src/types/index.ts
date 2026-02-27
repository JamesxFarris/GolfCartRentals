import type { Listing, Location, ClaimRequest, User } from "@prisma/client";

export type { Listing, Location, ClaimRequest, User };

export type ListingWithClaims = Listing & {
  claims: ClaimRequest[];
  claimedBy: User | null;
};

export type ClaimRequestWithListing = ClaimRequest & {
  listing: Listing;
  reviewedBy: User | null;
};

export interface SearchParams {
  q?: string;
  type?: string;
  passengers?: string;
  features?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
}

export interface LocationWithCount extends Location {
  _count?: {
    listings: number;
  };
  listingCount?: number;
}

declare module "next-auth" {
  interface User {
    role: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    id: string;
  }
}
