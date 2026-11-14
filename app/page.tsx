"use client";
import { useState } from "react";
import Link from "next/link";

export default function MainLandingPage() {
  // Calculator States for Landing Page
  const [weight, setWeight] = useState("");
  const [cbm, setCbm] = useState("");
  const estimatedAir = weight ? (parseFloat(weight) * 4.5).toFixed(2) : "0.00";
  const estimatedSea = cbm ? (parseFloat(cbm) * 120).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* ===== TOP NAVIGATION ===== */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0B1120]/80 border-b border-white/10 px-6 sm:px-12 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30 text-lg">S</div>
          <div className="text-2xl font-extrabold tracking-tight text-white">Swiftline<span className="text-blue-500">.</span></div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 transition">
            Sign In
          </Link>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            Get Free Address
          </Link>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden pt-20 pb-24 px-6 sm:px-12 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[120px] -z-10"></div>
        
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-blue-400 text-xs font-bold tracking-wider uppercase">
            🚀 Next-Gen B2B Sourcing & Logistics Portal
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight">
            Global Sourcing, QC & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Smart Logistics</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            ჩინეთიდან (Guangzhou) ලංකාවට සහ ඩුබායි වෙත භාණ්ඩ ගෙන්වීම, පාර්සල් ඒකාබද්ධ කිරීම (Consolidation) සහ කර්මාන්තශාලා තත්ත්ව පාලනය (QC) තනි පුවරුවකින් පාලනය කරන්න.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-2xl transition shadow-xl shadow-blue-900/50 flex items-center justify-center gap-2 text-base">
              Start Shipping Now ➔
            </Link>
            <a href="#calculator" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-8 py-4 rounded-2xl transition flex items-center justify-center gap-2 text-base">
              Calculate Shipping 🧮
            </a>
          </div>
        </div>
      </section>

      {/* ===== CORE FEATURES GRID ===== */}
      <section className="py-20 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold text-white">Engineered for Global Traders</h2>
          <p className="text-slate-400">ඔබේ ආනයන ව්‍යාපාරය ස්වයංක්‍රීය කිරීමට අවශ්‍ය සියලුම ප්‍රෝ විශේෂාංග.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md hover:border-blue-500/30 transition duration-300">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl mb-6">📦</div>
            <h3 className="text-xl font-bold text-white mb-2">Package Consolidation</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Taobao සහ 1688 වලින් ගන්නා කුඩා පාර්සල් එකම පෙට්ටියකට අසුරා (Repack) නැව් ගාස්තු 60% කින් අඩු කරගන්න.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md hover:border-emerald-500/30 transition duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl mb-6">🛡️</div>
            <h3 className="text-xl font-bold text-white mb-2">Smart QC Audits & AI</h3>
            <p className="text-slate-400 text-sm leading-relaxed">කර්මාන්තශාලා නිෂ්පාදන පරීක්ෂා කර AI තාක්ෂණය හරහා වෘත්තීය PDF වාර්තා සහ ඡායාරූප ලබා ගන්න.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md hover:border-purple-500/30 transition duration-300">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl mb-6">🌍</div>
            <h3 className="text-xl font-bold text-white mb-2">Global Live Tracking</h3>
            <p className="text-slate-400 text-sm leading-relaxed">SF Express, ZTO සහ DHL කුරියර් සේවාවල සජීවී ට්‍රැකින් තත්ත්වය පෝටලය හරහා නිරීක්ෂණය කරන්න.</p>
          </div>
        </div>
      </section>

      {/* ===== INTERACTIVE SHIPPING CALCULATOR SECTION ===== */}
      <section id="calculator" className="py-20 px-6 sm:px-12 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-blue-900/20 via-white/5 to-transparent border border-white/10 rounded-3xl p-8 sm:p-12 backdrop-blur-md shadow-2xl">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Instant Freight Calculator</h2>
            <p className="text-slate-400 text-sm">ඇස්තමේන්තුගත ගුවන් සහ මුහුදු නැව් ගාස්තු (Air & Sea Freight) දැනටමත් ගණනය කර බලන්න.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Weight (KG)</label>
                <input 
                  type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 20" 
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Volume (CBM)</label>
                <input 
                  type="number" value={cbm} onChange={(e) => setCbm(e.target.value)} placeholder="e.g. 1.5" 
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">✈️ Air Freight Estimate</span>
                <span className="text-2xl font-bold text-blue-400">${estimatedAir}</span>
              </div>
              <div className="h-px w-full bg-white/10"></div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">🚢 Sea Freight Estimate</span>
                <span className="text-2xl font-bold text-emerald-400">${estimatedSea}</span>
              </div>
              <Link href="/login" className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg text-sm">
                Book Shipment Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/10 py-8 px-6 sm:px-12 text-center text-sm text-slate-500">
        <p>© 2026 Swiftline Holdings (Pvt) Ltd. All rights reserved. Guangzhou & Sri Lanka.</p>
      </footer>
    </div>
  );
}