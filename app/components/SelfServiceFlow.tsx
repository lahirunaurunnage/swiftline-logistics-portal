export default function SelfServiceFlow() {
  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Frictionless Self-Service
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight">
            Take full control of your sourcing & QC in 3 simple steps.
          </h2>
          <p className="text-slate-400 text-lg">
            No agents to chase. No hidden quotes. Book, pay, and track everything directly from your portal dashboard.
          </p>
        </div>

        {/* 3-Step Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 relative group hover:border-indigo-500 transition">
            <div className="text-5xl font-extrabold text-indigo-500/20 mb-4">01</div>
            <h3 className="text-xl font-bold text-white mb-2">Configure Service</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Select Instant QC Inspection ($99 fixed)[cite: 9], Virtual Warehouse storage, or shipment tracking directly from your dashboard.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-900 text-xs font-mono text-indigo-400">
              → Instant CBM / Spec Calculation
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 relative group hover:border-purple-500 transition">
            <div className="text-5xl font-extrabold text-purple-500/20 mb-4">02</div>
            <h3 className="text-xl font-bold text-white mb-2">Secure Stripe Checkout</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Pay securely via Stripe in seconds. Your booking is instantly logged into the Supabase database without manual delays.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-900 text-xs font-mono text-purple-400">
              → Instant Job ID Generation
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 relative group hover:border-orange-500 transition">
            <div className="text-5xl font-extrabold text-orange-500/20 mb-4">03</div>
            <h3 className="text-xl font-bold text-white mb-2">Live Dashboard Tracking</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Monitor factory audit reports, inventory movement, and global cargo transit live from your personalized portal.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-900 text-xs font-mono text-orange-400">
              → Real-time Status Updates
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}