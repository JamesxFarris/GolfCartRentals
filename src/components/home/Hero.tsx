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
    <section className="relative bg-primary-900 overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-800 rounded-full -translate-y-1/2 translate-x-1/3 opacity-50" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-800 rounded-full translate-y-1/2 -translate-x-1/3 opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary-700/30 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary-700/20 rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
        <div className="text-center max-w-3xl mx-auto">
          {/* Trust signal */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-accent-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-400" />
            </span>
            <span className="text-sm text-primary-100 font-medium">
              183+ verified rental companies nationwide
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight">
            Find Golf Cart Rentals{" "}
            <span className="block mt-2">
              <span
                className={`inline-block text-accent-400 transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
              >
                {rotatingLocations[currentIndex]}
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-primary-200 max-w-2xl mx-auto leading-relaxed">
            Compare prices, check availability, and book from trusted rental
            companies across America&apos;s top destinations
          </p>

          {/* Search bar */}
          <div className="mt-8 sm:mt-10 max-w-2xl mx-auto">
            <SearchBar size="lg" />
          </div>

          {/* Quick links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <span className="text-xs text-primary-400 uppercase tracking-wider font-medium">Popular:</span>
            {["Myrtle Beach", "Destin", "The Villages", "Hilton Head"].map(
              (city) => (
                <Link
                  key={city}
                  href={`/search?q=${encodeURIComponent(city)}`}
                  className="text-sm text-primary-200 hover:text-white transition-colors underline decoration-primary-600 hover:decoration-white underline-offset-4"
                >
                  {city}
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      {/* Bottom edge accent */}
      <div className="h-1 bg-accent-500" />
    </section>
  );
}
