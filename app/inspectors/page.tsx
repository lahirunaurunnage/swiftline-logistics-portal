 import Link from 'next/link';
import PublicShell from '../components/PublicShell';

export default function InspectorsPage() {
  return (
    <PublicShell>
      <section className="py-24 bg-white min-h-[75vh]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Professional Field Auditing
            </span>
            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              Certified Inspectors with Enterprise Precision.
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed">
              Every Swiftline inspection is carried out by certified engineers equipped with precision measurement tools, safety gear, and instant digital reporting synced directly to your dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/inspector/login"
                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-base font-medium rounded-full transition shadow-xl text-center"
              >
                Inspector Portal Login
              </Link>
              <Link
                href="/inspector/apply"
                className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-medium rounded-full transition border border-slate-200 text-center"
              >
                Apply to Join Network
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md rounded-3xl bg-slate-900 p-3 shadow-2xl ring-1 ring-slate-900/10 overflow-hidden group">
            <div className="absolute top-5 right-5 z-10 bg-slate-950/80 backdrop-blur px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              EXPERT ENGINEER AUDIT
            </div>
            <img
              src="/inspector_branding.jpg"
              alt="Certified Professional Inspector"
              className="rounded-2xl w-full h-auto object-cover aspect-[4/3] group-hover:scale-105 transition duration-500"
            />
            <div className="p-4 bg-slate-950 text-white rounded-2xl mt-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-mono">GLOBAL STANDARDS</div>
                <div className="text-sm font-bold text-slate-200">Independent Factory Assessment</div>
              </div>
              <Link
                href="/dashboard/book-qc"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl transition"
              >
                Book ($99)
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}