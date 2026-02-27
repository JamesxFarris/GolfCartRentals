"use client";

import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface ClaimFormProps {
  listingId: string;
  listingName: string;
}

export default function ClaimForm({ listingId, listingName }: ClaimFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          name,
          email,
          phone,
          message,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit claim request");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-accent-50 border border-accent-200 rounded-xl p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-accent-600 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          Claim Request Submitted
        </h3>
        <p className="text-slate-600">
          Thank you for submitting your claim for <strong>{listingName}</strong>.
          Our team will review your request and get back to you within 1-2
          business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <Input
        label="Full Name"
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="John Doe"
      />

      <Input
        label="Email Address"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="john@example.com"
      />

      <Input
        label="Phone Number"
        type="tel"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="(555) 123-4567"
      />

      <div>
        <label
          htmlFor="claim-message"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Message (Optional)
        </label>
        <textarea
          id="claim-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your business and role..."
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-200 transition-colors duration-200"
        />
      </div>

      <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : "Submit Claim Request"}
      </Button>
    </form>
  );
}
