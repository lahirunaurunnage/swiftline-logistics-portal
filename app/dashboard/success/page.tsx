 'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quote_id') || 'SWIFT-884920';

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)] text-center space-y-6">
        
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          ✓
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white">Payment Successful & Courier Dispatched!</h1>
          <p className="text-slate-400 text-sm">Your shipment has been securely booked and pickup instructions sent to the carrier.</p>
        </div>

        {/* Waybill Card */}
        <div className="bg-black/50 p-6 rounded-2xl border border-white/10 text-left space-y-3 font-mono text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Reference ID:</span>
            <span className="text-white font-bold">{quoteId}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Waybill Barcode:</span>
            <span className="text-red-400 font-bold tracking-widest">||| | |||| || ||||| ||</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Courier Status:</span>
            <span className="text-emerald-400 font-bold">Pickup Scheduled 🟢</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button 
            onClick={() => window.print()}
            className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition text-xs cursor-pointer"
          >
            🖨️ Print Shipping Label
          </button>
          <Link 
            href="/dashboard" 
            className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition text-xs flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.4)]"
          >
            Go to Dashboard →
          </Link>
        </div>

      </div>
    </div>
  );
}