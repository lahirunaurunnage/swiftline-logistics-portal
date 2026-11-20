 'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicShell from './components/PublicShell';
import GlobalHubsGlobe from './components/GlobalHubsGlobe';

export default function HomePage() {
  const [trackingNo, setTrackingNo] = useState('');
  const [trackingResult, setTrackingResult] = useState<string | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNo) return;
    setTrackingResult(
      `Status for ${trackingNo}: 📦 In Transit - Customs Cleared at Guangzhou Hub (On Schedule) 🟢`
    );
  };

  return (
    <PublicShell>
      {/* Hero Section: Left Content + Right 3D Colombo Route Globe */}
      <section className="relative overflow-hidden pt-14 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 z-0 opacity-15 overflow-hidden pointer-events-none">
          <img
            src="/inspector_branding.jpg"
            alt="Background Blur"
            className="w-full h-full object-cover filter blur-3xl scale-110"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column (6 cols) */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Autonomous Global Sourcing & QC Operating System
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
                Take full control of your{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                  global supply chain.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                No chasing agents or waiting for manual quotations. Book instant factory QC audits for $99, manage virtual warehouses, and route parcels end-to-end completely on your own terms.
              </p>

              {/* Quick Live Tracking Bar */}
              <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xl max-w-xl mx-auto lg:mx-0">
                <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                    placeholder="Enter Tracking ID (e.g. SWIFT-9982)..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-3 rounded-xl text-xs transition cursor-pointer shadow-md"
                  >
                    Track Parcel ⚡
                  </button>
                </form>
                {trackingResult && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-mono">
                    {trackingResult}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1">
                <Link
                  href="/dashboard/book-qc"
                  className="inline-flex items-center justify-center font-medium bg-indigo-600 text-white px-7 py-3.5 rounded-full hover:bg-indigo-700 transition shadow-xl shadow-indigo-600/25 text-sm sm:text-base group"
                >
                  Book Instant QC ($99)
                  <span className="ml-2 group-hover:translate-x-1 transition">→</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center font-medium bg-white text-slate-800 px-7 py-3.5 rounded-full hover:bg-slate-50 transition text-sm sm:text-base border border-slate-200 shadow-sm"
                >
                  Access Portal Dashboard
                </Link>
              </div>

              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-slate-600 text-xs sm:text-sm font-medium max-w-xl mx-auto lg:mx-0">
                <div>
                  <strong className="text-slate-900 block text-base sm:text-lg">Self-Service</strong> Instant Actions
                </div>
                <div>
                  <strong className="text-slate-900 block text-base sm:text-lg">$99.00</strong> Flat QC Rate
                </div>
                <div>
                  <strong className="text-slate-900 block text-base sm:text-lg">Stripe</strong> Secured Payments
                </div>
              </div>
            </div>

            {/* Right Column (6 cols): 3D Globe */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <GlobalHubsGlobe />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Partners Strip */}
      <section className="py-12 border-y border-slate-200 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
            Empowering global importers with fully independent digital infrastructure
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition duration-300">
            <span className="text-xl font-bold tracking-tighter text-slate-800">GLOBAL SOURCING</span>
            <span className="text-xl font-bold tracking-widest text-slate-800">APEX LOGISTICS</span>
            <span className="text-xl font-bold tracking-tight text-slate-800">ZENITH HOLDINGS</span>
            <span className="text-xl font-bold tracking-widest text-slate-800">TRANS-ASIA</span>
          </div>
        </div>
      </section>

      {/* Quick Explore Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Explore Swiftline
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900">
              Everything you need in one connected system.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { href: '/quote', icon: '🧮', title: 'Instant Quote', desc: 'Estimate air & economy freight rates across global routes.' },
              { href: '/shipping', icon: '✈️', title: 'Global Shipping', desc: '1-click freight booking, labels & virtual warehouse sync.' },
              { href: '/inspectors', icon: '🛡️', title: 'Factory Inspectors', desc: 'Certified field engineers auditing your goods for $99.' },
              { href: '/platform', icon: '⚡', title: 'SaaS Platform', desc: 'See our 3-step self-service workflow & security stack.' },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="p-7 rounded-3xl bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-xl hover:border-indigo-300 transition space-y-3 group"
              >
                <div className="text-3xl">{card.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {card.title} →
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & Call to Action */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-purple-900/40 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            Transparent Self-Service Pricing
          </div>
          <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight">
            Professional Factory QC for just <span className="text-indigo-400">$99</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Take charge of your shipments today. No delayed quotations, no middlemen—just instant self-service execution.
          </p>
          <div className="pt-4">
            <Link
              href="/dashboard/book-qc"
              className="inline-flex items-center justify-center font-medium bg-indigo-600 text-white px-10 py-5 rounded-full hover:bg-indigo-700 transition shadow-2xl shadow-indigo-600/40 text-lg"
            >
              Start Your Self-Service QC Booking →
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            Secured and processed via Stripe Enterprise Payments. Instant dashboard confirmation.
          </p>
        </div>
      </section>
    </PublicShell>
  );
}