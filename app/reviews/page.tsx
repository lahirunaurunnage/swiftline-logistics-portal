 import PublicShell from '../components/PublicShell';

export default function ReviewsPage() {
  return (
    <PublicShell>
      <section className="py-24 bg-white min-h-[75vh]">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Verified Importer Feedback
            </span>
            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              Trusted by global sourcing leaders.
            </h1>
            <div className="flex items-center justify-center gap-1 text-amber-400 text-xl pt-2">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span className="text-slate-700 font-bold text-sm ml-2 font-mono">
                4.9 / 5.0 Rating (Over 500+ Audits)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex text-amber-400 text-sm">★★★★★</div>
              <p className="text-slate-700 text-sm italic leading-relaxed">
                &ldquo;Booking $99 QC inspections directly through the portal saved us weeks of back-and-forth communication with Chinese factories. Absolute game-changer.&rdquo;
              </p>
              <div>
                <div className="font-bold text-slate-900 text-sm">Michael Vance</div>
                <div className="text-xs text-slate-500">Supply Chain Director, Apex USA</div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex text-amber-400 text-sm">★★★★★</div>
              <p className="text-slate-700 text-sm italic leading-relaxed">
                &ldquo;The live WMS inbound tracking and instant freight aggregator saved us over 20% on shipping costs from Guangzhou to Dubai. Extremely robust platform!&rdquo;
              </p>
              <div>
                <div className="font-bold text-slate-900 text-sm">Tariq Al-Mansoor</div>
                <div className="text-xs text-slate-500">Managing Director, Dubai Hub</div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex text-amber-400 text-sm">★★★★★</div>
              <p className="text-slate-700 text-sm italic leading-relaxed">
                &ldquo;Clean interface, instant Stripe payments, and real-time inspector reports. This is what modern B2B logistics software is supposed to look like.&rdquo;
              </p>
              <div>
                <div className="font-bold text-slate-900 text-sm">Nuwan Perera</div>
                <div className="text-xs text-slate-500">Importer, Colombo Sri Lanka</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}