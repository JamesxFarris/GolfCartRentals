"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  size?: "lg" | "sm";
  defaultValue?: string;
}

export default function SearchBar({ size = "sm", defaultValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const isLarge = size === "lg";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`flex items-center bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-shadow focus-within:shadow-md focus-within:border-primary-300 ${
          isLarge ? "h-14 sm:h-16" : "h-10 sm:h-12"
        }`}
      >
        {/* Search icon */}
        <div className={`flex items-center justify-center shrink-0 text-slate-400 ${isLarge ? "pl-4 sm:pl-5" : "pl-3"}`}>
          <svg
            className={`${isLarge ? "h-5 w-5 sm:h-6 sm:w-6" : "h-4 w-4 sm:h-5 sm:w-5"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by city or zip code..."
          className={`flex-1 border-0 bg-transparent focus:outline-none focus:ring-0 text-slate-900 placeholder:text-slate-400 ${
            isLarge
              ? "px-3 sm:px-4 text-base sm:text-lg"
              : "px-2 sm:px-3 text-sm sm:text-base"
          }`}
          aria-label="Search by city or zip code"
        />

        {/* Submit button */}
        <button
          type="submit"
          className={`shrink-0 bg-primary-700 hover:bg-primary-800 text-white font-medium transition-colors ${
            isLarge
              ? "px-5 sm:px-8 h-full text-base sm:text-lg"
              : "px-3 sm:px-5 h-full text-sm sm:text-base"
          }`}
        >
          <span className="hidden sm:inline">Search</span>
          <svg
            className="h-5 w-5 sm:hidden"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
