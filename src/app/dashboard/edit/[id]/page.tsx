"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PhotoManager from "@/components/listings/PhotoManager";
import { CART_TYPES, FEATURES, getCartTypeLabel, getFeatureLabel } from "@/lib/utils";

interface ListingData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  streetAddress: string | null;
  city: string;
  state: string;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  cartTypes: string[];
  maxPassengers: number | null;
  rentalRadius: string | null;
  rateHourly: number | null;
  rateDaily: number | null;
  rateWeekly: number | null;
  rateMonthly: number | null;
  features: string[];
  operatingHours: Record<string, string> | null;
  photos: string[];
  claimedById: string | null;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function EditListingPage() {
  const { data: session } = useSession();
  const params = useParams();
  const listingId = params.id as string;

  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    cartTypes: [] as string[],
    maxPassengers: "",
    rentalRadius: "",
    rateHourly: "",
    rateDaily: "",
    rateWeekly: "",
    rateMonthly: "",
    features: [] as string[],
    operatingHours: {} as Record<string, string>,
  });

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings/${listingId}`);
        if (!res.ok) {
          setError("Listing not found");
          return;
        }
        const data = await res.json();

        // Verify ownership
        if (
          data.claimedById !== session?.user?.id &&
          session?.user?.role !== "ADMIN"
        ) {
          setError("You do not have permission to edit this listing");
          return;
        }

        setListing(data);
        setForm({
          name: data.name || "",
          description: data.description || "",
          streetAddress: data.streetAddress || "",
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zipCode || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          cartTypes: data.cartTypes || [],
          maxPassengers: data.maxPassengers?.toString() || "",
          rentalRadius: data.rentalRadius || "",
          rateHourly: data.rateHourly?.toString() || "",
          rateDaily: data.rateDaily?.toString() || "",
          rateWeekly: data.rateWeekly?.toString() || "",
          rateMonthly: data.rateMonthly?.toString() || "",
          features: data.features || [],
          operatingHours: data.operatingHours || {},
        });
      } catch {
        setError("Failed to load listing");
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchListing();
    }
  }, [listingId, session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleCartType = (type: string) => {
    setForm((prev) => ({
      ...prev,
      cartTypes: prev.cartTypes.includes(type)
        ? prev.cartTypes.filter((t) => t !== type)
        : [...prev.cartTypes, type],
    }));
  };

  const toggleFeature = (feature: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const setHours = (day: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      operatingHours: { ...prev.operatingHours, [day]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const body = {
        name: form.name,
        description: form.description || null,
        streetAddress: form.streetAddress || null,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode || null,
        phone: form.phone || null,
        email: form.email || null,
        website: form.website || null,
        cartTypes: form.cartTypes,
        maxPassengers: form.maxPassengers ? parseInt(form.maxPassengers) : null,
        rentalRadius: form.rentalRadius || null,
        rateHourly: form.rateHourly ? parseFloat(form.rateHourly) : null,
        rateDaily: form.rateDaily ? parseFloat(form.rateDaily) : null,
        rateWeekly: form.rateWeekly ? parseFloat(form.rateWeekly) : null,
        rateMonthly: form.rateMonthly ? parseFloat(form.rateMonthly) : null,
        features: form.features,
        operatingHours: Object.keys(form.operatingHours).length > 0 ? form.operatingHours : null,
      };

      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save changes");
        return;
      }

      setSuccess("Listing updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <p className="text-red-700 font-medium">{error}</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-primary-700 hover:text-primary-800 font-medium"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!listing) return null;

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-sm";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
          <p className="text-gray-500 text-sm mt-1">{listing.name}</p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 font-medium"
        >
          Back to Dashboard
        </Link>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      {error && listing && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Photo Manager */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
        <PhotoManager
          listingId={listing.id}
          initialPhotos={listing.photos}
          name={listing.name}
          canManage={true}
        />
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Location
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                name="streetAddress"
                type="text"
                value={form.streetAddress}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                name="state"
                type="text"
                value={form.state}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                name="zipCode"
                type="text"
                value={form.zipCode}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                name="website"
                type="url"
                value={form.website}
                onChange={handleChange}
                className={inputClass}
                placeholder="https://"
              />
            </div>
          </div>
        </div>

        {/* Cart Types & Features */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cart Types & Features
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cart Types
            </label>
            <div className="flex flex-wrap gap-2">
              {CART_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleCartType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.cartTypes.includes(type)
                      ? "bg-primary-50 border-primary-300 text-primary-700"
                      : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {getCartTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Passengers
              </label>
              <select
                name="maxPassengers"
                value={form.maxPassengers}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select</option>
                {[2, 4, 6, 8, 10, 12].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rental Radius
              </label>
              <input
                name="rentalRadius"
                type="text"
                value={form.rentalRadius}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g., 25 miles"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FEATURES.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors text-left ${
                    form.features.includes(feature)
                      ? "bg-primary-50 border-primary-300 text-primary-700"
                      : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className={`h-4 w-4 shrink-0 ${
                      form.features.includes(feature) ? "text-primary-600" : "text-gray-400"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={
                        form.features.includes(feature)
                          ? "M5 13l4 4L19 7"
                          : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                      }
                    />
                  </svg>
                  {getFeatureLabel(feature)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rental Rates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Rental Rates
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  name="rateHourly"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.rateHourly}
                  onChange={handleChange}
                  className={`${inputClass} pl-7`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily Rate
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  name="rateDaily"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.rateDaily}
                  onChange={handleChange}
                  className={`${inputClass} pl-7`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weekly Rate
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  name="rateWeekly"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.rateWeekly}
                  onChange={handleChange}
                  className={`${inputClass} pl-7`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rate
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  name="rateMonthly"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.rateMonthly}
                  onChange={handleChange}
                  className={`${inputClass} pl-7`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Operating Hours
          </h2>
          <div className="space-y-3">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center gap-4">
                <label className="w-28 text-sm font-medium text-gray-700">
                  {day}
                </label>
                <input
                  type="text"
                  value={form.operatingHours[day] || ""}
                  onChange={(e) => setHours(day, e.target.value)}
                  className={inputClass}
                  placeholder="e.g., 8:00 AM - 6:00 PM or Closed"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-primary-700 text-white rounded-lg font-medium hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href="/dashboard"
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
