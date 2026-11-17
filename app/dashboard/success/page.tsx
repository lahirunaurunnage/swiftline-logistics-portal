
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

function SuccessContent() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quote_id') || 'SWIFT-884920';

  return (
    <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
      <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-3xl rounded-full flex items-center justify-center mx-auto">
        ✓
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-white">Payment Successful!</h1>
        <p className="text-slate-400 text-xs">Your payment has been securely processed via Stripe. Your booking/quote has been logged.</p>
      </div>

      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-indigo-400">
        Reference ID: {quoteId}
      </div>

      <div className="pt-2">
        <Link href="/dashboard" className="block w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/30">
          Return to Dashboard 🚀
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-slate-400 font-mono text-xs">Loading payment details...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}