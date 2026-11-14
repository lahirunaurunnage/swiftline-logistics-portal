 "use client";
import { useState } from "react";
import Link from "next/link";

export default function AdminConsolidation() {
  const [consolidations] = useState([
    { id: "req-1", user: "SWIFT-1050", packages: 3, oldWeight: "7.7", status: "Pending Packing" },
    { id: "req-2", user: "SWIFT-1022", packages: 5, oldWeight: "12.4", status: "Packed" }
  ]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-[#0B1120] border-r border-white/10 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">W</div>
          <div className="text-xl font-bold tracking-tight text-white">Swiftline<span className="text-red-500">.</span> WMS</div>
        </div>
        <nav className="space-y-2 flex-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white text-sm font-medium"><span>📟</span> Inbound Scanner</Link>
          <Link href="/admin/consolidation" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white text-sm font-medium"><span>📦</span> Consolidation Hub</Link>
          <Link href="/admin/qc" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white text-sm font-medium"><span>✨</span> Smart AI QC</Link>
        </nav>
        <div className="mt-auto pt-6 border-t border-white/10">
          <Link href="/dashboard" className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition text-sm font-medium">
            👁️ View Client Portal
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10 bg-[#0B1120]/80 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          <div>
            <h1 className="text-2xl font-bold text-white">Consolidation Manager</h1>
            <p className="text-sm text-slate-400">Manage client package bundling requests</p>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">System Online 🟢</span>
        </header>

        <div className="bg-[#0B1120] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-bold text-white">Pending Consolidation Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-5 font-semibold">Client</th>
                  <th className="p-5 font-semibold text-center">Items to Merge</th>
                  <th className="p-5 font-semibold">Total Old Weight</th>
                  <th className="p-5 font-semibold">Status</th>
                  <th className="p-5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {consolidations.map((req) => (
                  <tr key={req.id} className="hover:bg-white/5 transition">
                    <td className="p-5 font-bold text-blue-400">{req.user}</td>
                    <td className="p-5 text-center text-white font-medium">{req.packages} Packages</td>
                    <td className="p-5 text-slate-300">{req.oldWeight} KG</td>
                    <td className="p-5">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${req.status === 'Pending Packing' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-md">
                        Enter New Weight
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}