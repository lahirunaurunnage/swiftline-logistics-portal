 "use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminWMSPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Package Scanning Form States
  const [swiftCode, setSwiftCode] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierName, setCourierName] = useState("SF Express");
  const [weightKg, setWeightKg] = useState("");
  const [description, setDescription] = useState("");

  // Success / Error messages
  const [message, setMessage] = useState("");

  const handleScanPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 1. Find user profile by SWIFT Code
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("swift_code", swiftCode.trim().toUpperCase())
        .single();

      if (profileError || !profile) {
        throw new Error("Invalid SWIFT Code! User not found.");
      }

      // 2. Insert package into 'packages' table
      const { error: insertError } = await supabase.from("packages").insert([
        {
          user_id: profile.id,
          tracking_number: trackingNumber.trim(),
          courier_name: courierName,
          weight: parseFloat(weightKg) || 0,
          description: description,
          status: "Arrived at Warehouse"
        }
      ]);

      if (insertError) throw insertError;

      setMessage("success: Package scanned and assigned to client successfully!");
      setTrackingNumber("");
      setWeightKg("");
      setDescription("");
      setSwiftCode("");

    } catch (err: any) {
      setMessage("error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-[#060913] border border-white/10 p-6 rounded-3xl backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-bold text-white">Guangzhou WMS & Barcode Scanner 🏭</h1>
            <p className="text-slate-400 text-sm mt-1">ଗබඩාවට එන කුඩා පාර්සල් ස්කෑන් කර පාරිභෝගිකයාට සම්බන්ධ කිරීම.</p>
          </div>
          <Link href="/dashboard" className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm transition">
            Exit WMS
          </Link>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-2xl border text-sm font-medium ${message.startsWith("success") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {message.replace(/^(success|error):\s*/, "")}
          </div>
        )}

        {/* Scanner Form */}
        <div className="bg-[#060913] border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6">📦 Inbound Package Registration</h2>
          
          <form onSubmit={handleScanPackage} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Client SWIFT Code</label>
              <input 
                type="text" value={swiftCode} onChange={(e) => setSwiftCode(e.target.value)} required
                placeholder="e.g. SWIFT-1001" 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Courier Tracking Number</label>
              <input 
                type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} required
                placeholder="e.g. SF1002938485" 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Courier Name</label>
              <select 
                value={courierName} onChange={(e) => setCourierName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              >
                <option value="SF Express">SF Express</option>
                <option value="ZTO Express">ZTO Express</option>
                <option value="YTO Express">YTO Express</option>
                <option value="JD Logistics">JD Logistics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Weight (KG)</label>
              <input 
                type="number" step="0.01" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} required
                placeholder="e.g. 1.5" 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Item Description / Notes</label>
              <input 
                type="text" value={description} onChange={(e) => setDescription(e.target.value)} 
                placeholder="e.g. Silicone phone cases (50 pcs)" 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2 pt-4">
              <button 
                type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {loading ? "Registering Package..." : "Scan & Register Inbound Package 🚀"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}