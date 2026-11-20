'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicShell from '../components/PublicShell';

export default function QuotePage() {
  const [weight, setWeight] = useState('');
  const [destination, setDestination] = useState('USA');
  const [serviceType, setServiceType] = useState('Air Express');
  const [quoteResult, setQuoteResult] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    setCalculating(true);
    setTimeout(() => {
      const w = parseFloat(weight);
      const base = serviceType === 'Air Express' ? 15 : 8;
      const total = w * base + 30;
      setQuoteResult(parseFloat(total.toFixed(2)));
      setCalculating(false);
    }, 800);
  };

  return (
    <PublicShell>
      <section className="py-20 bg-slate-50 min-h-[75vh]">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Interactive Self-Service Engine
            </span>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-900">
              Instant Shipping &amp; Freight Estimator
            </h1>
            <p className="text-slate-600 text-sm sm:text-base">
              Calculate precise shipping estimates across global trade routes instantly.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-2">Package Weight (KG)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 10.5"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 font-mono focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-2">Destination Route</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3"
                >
                  <option value="USA">Guangzhou ➔ United States</option>
                  <option value="EU">Guangzhou ➔ European Union</option>
                  <option value="UAE">Dubai ➔ Colombo / Global</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-2">Service Speed</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3"
                >
                  <option value="Air Express">Air Express (3-5 Days)</option>
                  <option value="Economy Freight">Economy Air (7-10 Days)</option>
                </select>
              </div>
              <div className="sm:col-span-3 pt-2">
                <button
                  type="submit"
                  disabled={calculating}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl transition cursor-pointer text-sm shadow-xl shadow-indigo-600/20"
                >
                  {calculating ? 'Calculating Global Rates...' : 'Calculate Estimate Now 🚀'}
                </button>
              </div>
            </form>

            {quoteResult !== null && (
              <div className="mt-6 bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
                <p className="text-xs text-emerald-800 uppercase font-mono">Estimated Freight &amp; Handling Quote:</p>
                <p className="text-3xl font-extrabold text-emerald-600 font-mono">${quoteResult} USD</p>
                <p className="text-xs text-slate-500">
                  Includes secure handling, multi-carrier optimization, and customs pre-clearance.
                </p>
                <div className="pt-2">
                  <Link
                    href="/dashboard/book-shipment"
                    className="inline-block px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-full transition"
                  >
                    Proceed to Book Shipment →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}