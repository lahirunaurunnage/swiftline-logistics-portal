
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/quote', label: 'Instant Quote 🧮' },
  { href: '/track', label: 'Live Track 🔍' },
  { href: '/platform', label: 'Platform' },
  { href: '/inspectors', label: 'Inspectors' },
  { href: '/shipping', label: 'Shipping' },
  { href: '/reviews', label: 'Reviews ⭐' },
  { href: '/faq', label: 'FAQ' },
];

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-indigo-500 selection:text-white overflow-x-hidden font-sans relative">
      {/* Background Professional CSS Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10"></div>

      {/* 0. Top Live Global Status Ticker */}
      <div className="bg-slate-950 text-slate-400 text-xs py-2 px-6 border-b border-slate-800 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-indigo-400 font-semibold">GLOBAL HUBS ONLINE:</span>
            <span>Guangzhou (Active)</span> • <span>Dubai (Active)</span> • <span>Colombo (Operational)</span>
          </div>
          <div className="flex items-center gap-4">
            <span>⚡ Autonomous Engine v4.5</span>
            <span className="text-emerald-400">● Stripe Secure</span>
          </div>
        </div>
      </div>

      {/* 1. Shared SaaS Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="Swiftline International Logistics"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            {NAV_LINKS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition ${
                    active ? 'text-indigo-600 font-bold' : 'hover:text-indigo-600'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-block text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard/book-qc"
              className="text-sm font-medium bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
            >
              Book QC ($99)
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700"
              aria-label="Toggle menu"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-2 shadow-lg">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  pathname === item.href ? 'text-indigo-600 font-bold' : 'text-slate-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 border-t border-slate-100 pt-3"
            >
              Sign In
            </Link>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Shared Enterprise Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Swiftline Holdings" className="h-8 w-auto brightness-200" />
            <span className="text-sm font-medium text-slate-300">
              © 2026 Swiftline Holdings. All rights reserved.
            </span>
          </Link>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/platform" className="hover:text-white transition">Platform</Link>
            <Link href="/shipping" className="hover:text-white transition">Shipping</Link>
            <Link href="/inspectors" className="hover:text-white transition">Inspectors</Link>
            <Link href="/faq" className="hover:text-white transition">FAQ</Link>
            <Link href="/dashboard" className="hover:text-white transition">Client Portal</Link>
            <Link href="/dashboard/book-qc" className="hover:text-white transition">Book QC</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}