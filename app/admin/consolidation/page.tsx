 "use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminConsolidationPage() {
  const [swiftCode, setSwiftCode] = useState("");
  const [packageIds, setPackageIds] = useState("");
  const [finalWeight, setFinalWeight] = useState("");
  const [finalCbm, setFinalCbm] = useState("");
  const [shippingMode, setShippingMode] = useState("Air Freight");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleConsolidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 1. Get client profile by SWIFT Code
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("swift_code", swiftCode.trim().toUpperCase())
        .single();

      if (profileError || !profile) {
        throw new Error("Invalid SWIFT Code! Client not found.");
      }

      // 2. Create a new consolidated shipment record in 'shipments' table
      const { error: shipmentError } = await supabase.from("shipments").insert([
        {
          user_id: profile.id,
          package_ids: packageIds.split(',').map(id => id.trim()),
          total_weight: parseFloat(finalWeight) || 0,
          total_cbm: parseFloat(finalCbm) || 0,
          shipping_mode: shippingMode,
          status: "Consolidated & Packed"
        }
      ]);

      if (shipmentError) throw shipmentError;

      setMessage("success: Packages successfully consolidated and shipment created!");
      setSwiftCode("");
      setPackageIds("");
      setFinalWeight("");
      setFinalCbm("");

    } catch (err: any) {
      setMessage("error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-[#060913] border border-white/10 p-6 rounded-3xl backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-bold text-white">Consolidation Manager 📦➔📦</h1>
            <p className="text-slate-400 text-sm mt-1">ਕුඩා පාර්සල් එකතු කර (Repack) අවසාන නැව්ගත කිරීම සකස් කරන්න.</p>
          </div>
          <Link href="/admin/wms" className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm transition">
            Back to WMS Scanner
          </Link>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`p-4 rounded-2xl border text-sm font-medium ${message.startsWith("success") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {message.replace(/^(success|error):\s*/, "")}
          </div>
        )}

        {/* Form */}
        <div className="bg-[#060913] border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6">⚙️ Repack & Create Final Shipment</h2>
          
          <form onSubmit={handleConsolidate} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Client SWIFT Code</label>
              <input 
                type="text" value={swiftCode} onChange={(e) => setSwiftCode(e.target.value)} required
                placeholder="e.g. SWIFT-1001" 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Package IDs (Comma separated)</label>
              <input 
                type="text" value={packageIds} onChange={(e) => setPackageIds(e.target.value)} required
                placeholder="e.g. PKG-01, PKG-02, PKG-03" 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Final Repacked Weight (KG)</label>
              <input 
                type="number" step="0.01" value={finalWeight} onChange={(e) => setFinalWeight(e.target.value)} required
                placeholder="e.g. 12.5" 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Final Volume (CBM)</label>
              <input 
                type="number" step="0.001" value={finalCbm} onChange={(e) => setFinalCbm(e.target.value)} 
                placeholder="e.g. 0.15" 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shipping Mode</label>
              <select 
                value={shippingMode} onChange={(e) => setShippingMode(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              >
                <option value="Air Freight">✈️ Air Freight (Express)</option>
                <option value="Sea Freight">🚢 Sea Freight (Container / LCL)</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-4">
              <button 
                type="submit" disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                {loading ? "Processing Consolidation..." : "Confirm Repack & Create Shipment 🚀"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}