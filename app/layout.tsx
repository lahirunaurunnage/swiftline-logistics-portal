
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swiftline Holdings | Global Sourcing & Smart Logistics",
  description: "Next-Gen B2B Sourcing, QC Audits & Logistics Platform for Guangzhou, Sri Lanka & Dubai.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Google Sitelinks & SEO Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Swiftline Sourcing & QC Portal",
              "url": "https://swiftlineholdings.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://swiftlineholdings.com/dashboard?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "hasPart": [
                {
                  "@type": "WebPage",
                  "name": "Book QC Inspection",
                  "url": "https://swiftlineholdings.com/dashboard/book-qc"
                },
                {
                  "@type": "WebPage",
                  "name": "Virtual Warehouse Address",
                  "url": "https://swiftlineholdings.com/dashboard/warehouse"
                },
                {
                  "@type": "WebPage",
                  "name": "Global Package Tracker",
                  "url": "https://swiftlineholdings.com/dashboard/tracker"
                },
                {
                  "@type": "WebPage",
                  "name": "Package Consolidation",
                  "url": "https://swiftlineholdings.com/dashboard/inventory"
                },
                {
                  "@type": "WebPage",
                  "name": "Commercial Invoices & Support",
                  "url": "https://swiftlineholdings.com/dashboard/support"
                }
              ]
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}