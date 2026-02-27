"use client";

import { useState, useEffect } from "react";

interface Claim {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  listing: {
    id: string;
    name: string;
    city: string;
    state: string;
    claimStatus: string;
  };
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchClaims = async () => {
    try {
      const res = await fetch("/api/claims");
      const data = await res.json();
      setClaims(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching claims:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleAction = async (claimId: string, status: "APPROVED" | "DENIED") => {
    setProcessing(claimId);
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        await fetchClaims();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update claim");
      }
    } catch (error) {
      console.error("Error updating claim:", error);
      alert("Failed to update claim");
    } finally {
      setProcessing(null);
    }
  };

  const pendingClaims = claims.filter((c) => c.status === "PENDING");
  const approvedClaims = claims.filter((c) => c.status === "APPROVED");
  const deniedClaims = claims.filter((c) => c.status === "DENIED");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  const renderClaimTable = (claimList: Claim[], title: string, showActions: boolean) => {
    if (claimList.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {title} ({claimList.length})
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claimant Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                {showActions && (
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {claimList.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {claim.listing.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {claim.listing.city}, {claim.listing.state}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {claim.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {claim.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {claim.phone}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        claim.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : claim.status === "DENIED"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(claim.createdAt)}
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleAction(claim.id, "APPROVED")}
                          disabled={processing === claim.id}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {processing === claim.id ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleAction(claim.id, "DENIED")}
                          disabled={processing === claim.id}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          {processing === claim.id ? "..." : "Deny"}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Claims</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage business claim requests
        </p>
      </div>

      {claims.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          No claim requests yet
        </div>
      ) : (
        <>
          {renderClaimTable(pendingClaims, "Pending Claims", true)}
          {renderClaimTable(approvedClaims, "Approved Claims", false)}
          {renderClaimTable(deniedClaims, "Denied Claims", false)}
        </>
      )}
    </div>
  );
}
