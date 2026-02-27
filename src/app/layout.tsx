import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navbar, Footer } from "@/components/layout";
import "./globals.css";

const inter = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Golf Cart Rentals Near You | GolfCartsForRentNearMe.com",
  description:
    "Find the best golf cart rentals near you. Browse hundreds of rental companies, compare prices, and book your golf cart rental today. Electric, gas, and LSV options available.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased flex flex-col min-h-screen`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
