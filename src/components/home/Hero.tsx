"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SearchBar from "@/components/search/SearchBar";

const rotatingLocations = [
  "in Myrtle Beach",
  "in Destin",
  "in The Villages",
  "on Hilton Head Island",
  "in Gulf Shores",
  "on Put-in-Bay",
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % rotatingLocations.length);
        setIsVisible(true);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
        <div className="text-center max-w-3xl mx-auto">
          {/* Main heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
            Find Golf Cart Rentals{" "}
            <span className="block mt-2">
              <span
                className={`inline-block text-accent-300 transition-opacity duration-500 ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                {rotatingLocations[currentIndex]}
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
            Browse hundreds of golf cart rental companies across America&apos;s
            top destinations
          </p>

          {/* Search bar */}
          <div className="mt-8 sm:mt-10 max-w-2xl mx-auto">
            <SearchBar size="lg" />
          </div>

          {/* Browse All Locations link */}
          <div className="mt-6">
            <Link
              href="/locations"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-200 hover:text-white transition-colors"
            >
              Browse All Locations
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
