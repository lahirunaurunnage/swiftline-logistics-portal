 "use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminScanner() {
  const [swiftCode, setSwiftCode] = useState("");
  const [trackingNo, setTrackingNo] = useState("");
  const [weight, setWeight] = useState("");
  const [courier, setCourier] = useState("SF Express");
  const [submitting, setSubmitting] = useState(false);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swiftCode || !trackingNo || !weight) {
      alert("தயவுசெய்து அனைத்து விவரங்களையும் நிரப்பவும் (Please fill all fields).");
      return;
    }

    setSubmitting(true);

    try {
      // 1. මුලින්ම profiles වගුවෙන් මෙම SWIFT කේතයට අදාළ user_id එක සොයා ගැනීම
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("swift_code", swiftCode.trim().toUpperCase())
        .single();

      if (profileError || !profileData) {
        alert("සමාවන්න! මෙම SWIFT කේතය සහිත පරිශීලකයෙකු හමු නොවීය. (Client SWIFT code not found)");
        setSubmitting(false);
        return;
      }

      const userId = profileData.id;

      // 2. packages වගුවට අලුත් පාර්සලය ඇතුළත් කිරීම
      const { error: insertError } = await supabase
        .from("packages")
        .insert([
          {
            user_id: userId,
            local_tracking_number: trackingNo.trim(),
            courier_name: courier,
            weight_kg: parseFloat(weight),
            status: "In Warehouse"
          }
        ]);

      if (insertError) {
        alert("Error saving package: " + insertError.message);
      } else {
        alert(`Package ${trackingNo} successfully assigned to ${swiftCode.toUpperCase()}!`);
        setSwiftCode("");
        setTrackingNo("");
        setWeight("");
      }
    } catch (err: any) {
      alert("An unexpected error occurred: " + err.message);
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-[#0B1120] border-r border-white/10 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">W</div>
          <div className="text-xl font-bold tracking-tight text-white">Swiftline<span className="text-red-500">.</span> WMS</div>
        </div>
        <nav className="space-y-2 flex-1">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white text-sm font-medium"><span>📊</span> Admin Overview</Link>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white text-sm font-medium"><span>📟</span> Inbound Scanner</Link>
          <Link href="/admin/consolidation" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white text-sm font-medium"><span>📦</span> Consolidation Hub</Link>
          <Link href="/admin/qc" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white text-sm font-medium"><span>✨</span> Smart AI QC</Link>
          <Link href="/admin/support" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white text-sm font-medium"><span>🎧</span> Support Tickets</Link>
        </nav>
        <div className="mt-auto pt-6 border-t border-white/10">
          <Link href="/dashboard" className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition text-sm font-medium">
            👁️ View Client Portal
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10 bg-[#0B1120]/85 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          <div>
            <h1 className="text-2xl font-bold text-white">Warehouse Inbound Scanner</h1>
            <p className="text-sm text-slate-400">Guangzhou Central Warehouse Operations</p>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">System Online 🟢</span>
        </header>

        <div className="max-w-xl mx-auto bg-[#0B1120] rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">📟</div>
            <h2 className="text-xl font-bold text-white">Register Incoming Package</h2>
            <p className="text-slate-400 text-sm">Enter client SWIFT code and scan tracking number.</p>
          </div>

          <form onSubmit={handleScanSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Client SWIFT Code</label>
                <input 
                  type="text" value={swiftCode} onChange={(e) => setSwiftCode(e.target.value)} 
                  placeholder="e.g. SWIFT-1001" required 
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-mono font-bold uppercase" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Courier</label>
                <select 
                  value={courier} onChange={(e) => setCourier(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
                >
                  <option>SF Express</option>
                  <option>ZTO Express</option>
                  <option>YTO Express</option>
                  <option>DHL / UPS</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tracking Number</label>
              <input 
                type="text" value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)} 
                placeholder="Scan barcode here..." required 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-red-500 font-mono shadow-inner" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Weight (KG)</label>
              <input 
                type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} 
                placeholder="0.00" required 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-medium" 
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting} 
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white font-bold py-4 rounded-xl transition shadow-[0_0_20px_rgba(220,38,38,0.4)] mt-4"
            >
              {submitting ? "Processing Package..." : "➕ Assign to Inventory & Save"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}