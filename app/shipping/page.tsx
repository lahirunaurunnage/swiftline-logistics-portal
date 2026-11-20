 import Link from 'next/link';
import PublicShell from '../components/PublicShell';

export default function ShippingPage() {
  return (
    <PublicShell>
      <section className="py-24 bg-white min-h-[75vh]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Autonomous Logistics
              </span>
              <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
                Ship your goods globally. Instantly.
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed">
                Get real-time shipping quotations, book freight services, and generate shipping labels directly from your Swiftline dashboard. No more waiting for email quotes or calling agents.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/dashboard/get-quote"
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-medium rounded-full transition shadow-xl shadow-indigo-600/25"
                >
                  Get Instant Shipping Quote →
                </Link>
                <Link
                  href="/quote"
                  className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-medium rounded-full transition border border-slate-200"
                >
                  Try Rate Estimator
                </Link>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Simple 1-Click Booking</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 shadow-sm">
                  Guangzhou ➔ New York
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 shadow-sm">
                  Dubai ➔ Colombo
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p>✅ Instant Rate Calculation (Air/Sea)</p>
                <p>✅ Automated Label Generation</p>
                <p>✅ Live Parcel Tracking</p>
                <p>✅ Virtual Warehouse Integration</p>
              </div>
              <Link
                href="/dashboard/book-shipment"
                className="block w-full text-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition"
              >
                Book Shipping Service
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}