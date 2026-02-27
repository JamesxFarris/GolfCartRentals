"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  totalListings: number;
  pendingClaims: number;
  claimedListings: number;
  totalUsers: number;
}

interface Claim {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  listing: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
}

interface Listing {
  id: string;
  name: string;
  city: string;
  state: string;
  claimStatus: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalListings: 0,
    pendingClaims: 0,
    claimedListings: 0,
    totalUsers: 0,
  });
  const [recentClaims, setRecentClaims] = useState<Claim[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [listingsRes, claimsRes, usersRes] = await Promise.all([
          fetch("/api/listings?limit=5"),
          fetch("/api/claims"),
          fetch("/api/users"),
        ]);

        const listingsData = await listingsRes.json();
        const claimsData = await claimsRes.json();
        const usersData = await usersRes.json();

        const listings = listingsData.listings || [];
        const claims = Array.isArray(claimsData) ? claimsData : [];
        const users = Array.isArray(usersData) ? usersData : [];

        const pendingClaims = claims.filter(
          (c: Claim) => c.status === "PENDING"
        );
        const claimedCount = listings.filter(
          (l: Listing) => l.claimStatus === "CLAIMED"
        ).length;

        setStats({
          totalListings: listingsData.total || 0,
          pendingClaims: pendingClaims.length,
          claimedListings: claimedCount,
          totalUsers: users.length,
        });

        setRecentClaims(pendingClaims.slice(0, 5));
        setRecentListings(listings.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Listings",
      value: stats.totalListings,
      color: "bg-blue-500",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
    {
      label: "Pending Claims",
      value: stats.pendingClaims,
      color: "bg-amber-500",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Claimed Listings",
      value: stats.claimedListings,
      color: "bg-green-500",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      color: "bg-purple-500",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div
                className={`${card.color} p-3 rounded-lg`}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={card.icon}
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Pending Claims */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Claims
            </h2>
            <Link
              href="/admin/claims"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            {recentClaims.length === 0 ? (
              <p className="text-gray-500 text-sm">No pending claims</p>
            ) : (
              <div className="space-y-4">
                {recentClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {claim.listing.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {claim.name} ({claim.email})
                      </p>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Listings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Listings
            </h2>
            <Link
              href="/admin/listings"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            {recentListings.length === 0 ? (
              <p className="text-gray-500 text-sm">No listings yet</p>
            ) : (
              <div className="space-y-4">
                {recentListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {listing.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {listing.city}, {listing.state}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        listing.claimStatus === "CLAIMED"
                          ? "bg-green-100 text-green-700"
                          : listing.claimStatus === "PENDING"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {listing.claimStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
