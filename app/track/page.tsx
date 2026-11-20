 'use client';

import { useState } from 'react';
import PublicShell from '../components/PublicShell';

export default function TrackPage() {
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
      <section className="py-24 bg-white min-h-[75vh]">
        <div className="max-w-3xl mx-auto px-6 space-y-10 text-center">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Real-Time Parcel Telemetry
            </span>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-900">Live Global Parcel Tracking</h1>
            <p className="text-slate-600 text-base">
              Enter your Swiftline tracking reference to monitor factory handoff, customs clearance, and final delivery.
            </p>
          </div>

          <div className="bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xl">
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
                placeholder="Enter Tracking ID (e.g. SWIFT-9982)..."
                className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-mono focus:outline-none focus:border-indigo-600"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-2xl text-sm transition cursor-pointer shadow-md"
              >
                Track Parcel ⚡
              </button>
            </form>

            {trackingResult && (
              <div className="mt-5 p-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-mono text-left">
                {trackingResult}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-mono text-indigo-600 font-bold">HUB 01</div>
              <div className="font-bold text-slate-900 mt-1">Guangzhou, China</div>
              <div className="text-xs text-emerald-600 mt-1">● Operational &amp; Dispatching</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-mono text-purple-600 font-bold">HUB 02</div>
              <div className="font-bold text-slate-900 mt-1">Dubai, UAE</div>
              <div className="text-xs text-emerald-600 mt-1">● Transit Consolidation Active</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-mono text-emerald-600 font-bold">HUB 03</div>
              <div className="font-bold text-slate-900 mt-1">Colombo, Sri Lanka</div>
              <div className="text-xs text-emerald-600 mt-1">● Customs &amp; Distribution Live</div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}