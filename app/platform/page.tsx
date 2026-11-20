 import PublicShell from '../components/PublicShell';

export default function PlatformPage() {
  return (
    <PublicShell>
      {/* Self-Service Workflow Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Autonomous Self-Service Engine
            </span>
            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight">
              Take full control of your sourcing &amp; QC in 3 simple steps.
            </h1>
            <p className="text-slate-400 text-lg">
              No agents to chase. No hidden quotes. Book, pay, and route your parcels directly from your portal dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 relative group hover:border-indigo-500 transition">
              <div className="text-5xl font-extrabold text-indigo-500/20 mb-4">01</div>
              <h3 className="text-xl font-bold text-white mb-2">Configure Service</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Select Instant QC Inspection ($99 fixed), Virtual Warehouse storage, or shipment routing directly from your dashboard.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-900 text-xs font-mono text-indigo-400">
                → Instant CBM / Spec Calculation
              </div>
            </div>

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

      {/* Core SaaS Features Grid */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600">Built for Independent Importers</h2>
            <h3 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              Manage your cargo your way.
            </h3>
            <p className="text-slate-600 text-lg">
              Empowering you with complete self-service tools to route parcels and audit manufacturers without intermediaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-xl transition space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/30">
                🛡️
              </div>
              <h4 className="text-xl font-bold text-slate-900">Self-Book QC ($99)</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Trigger factory inspections yourself in 1-click. Fixed transparent pricing processed securely through Stripe.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-xl transition space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-600/30">
                📦
              </div>
              <h4 className="text-xl font-bold text-slate-900">Virtual Inventory</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Consolidate your goods and route your parcels across international hubs using your interactive client dashboard.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-xl transition space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-orange-500/30">
                ⚡
              </div>
              <h4 className="text-xl font-bold text-slate-900">Direct Tracking</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Monitor your shipment status live from factory floor to destination without ever needing to call or email an agent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Security & Compliance Trust Bar */}
      <section className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-900">🔒 SSL 256-Bit</div>
            <div className="text-xs text-slate-500 mt-1">Encrypted Data Transport</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">💳 Stripe Verified</div>
            <div className="text-xs text-slate-500 mt-1">PCI-DSS Level 1 Gateway</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">🌐 Global Nodes</div>
            <div className="text-xs text-slate-500 mt-1">Guangzhou, Dubai, Colombo</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">⚡ Instant Sync</div>
            <div className="text-xs text-slate-500 mt-1">Supabase Realtime Database</div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}