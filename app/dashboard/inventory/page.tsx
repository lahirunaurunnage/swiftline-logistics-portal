"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardInventory() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventoryData = async () => {
      // 1. Authenticate user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // 2. Fetch User Profile (SWIFT Code)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profileData) setProfile(profileData);

      // 3. Fetch Real Packages from Supabase 'packages' table for this user
      const { data: pkgData, error: pkgError } = await supabase
        .from("packages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (pkgData) {
        setPackages(pkgData);
      }
      setLoading(false);
    };

    fetchInventoryData();
  }, [router]);

  const togglePackageSelection = (id: string) => {
    if (selectedPackages.includes(id)) {
      setSelectedPackages(selectedPackages.filter(p => p !== id));
    } else {
      setSelectedPackages([...selectedPackages, id]);
    }
  };

  const handleConsolidateRequest = async () => {
    if (selectedPackages.length < 2) {
      alert("தயவுசெய்து குறைந்தபட்சம் 2 தொகுப்புகளைத் தேர்ந்தெடுக்கவும் (Please select at least 2 packages).");
      return;
    }
    
    // මෙහිදී Consolidation ඉල්ලීම Database එකට යැවීමේ ලොජික් එක ලිවිය හැක
    alert(`Consolidation request submitted successfully for ${selectedPackages.length} packages! Admin will pack and update weight.`);
    setSelectedPackages([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1120] text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm tracking-widest uppercase">Loading Inventory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0B1120]/80 border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">S</div>
          <div className="text-xl font-bold text-white">Swiftline<span className="text-blue-500">.</span> Portal</div>
        </div>
        <div className="flex items-center gap-4">
          {profile && (
            <span className="text-sm font-bold bg-blue-600 text-white px-3 py-1 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]">
              {profile.swift_code}
            </span>
          )}
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">Back to Overview</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Sub Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit mb-8 border border-white/5 backdrop-blur-md overflow-x-auto">
          <Link href="/dashboard" className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2">
            <span>📊</span> Overview
          </Link>
          <Link href="/dashboard/inventory" className="px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white shadow-lg shadow-blue-900/50 flex items-center gap-2">
            <span>📦</span> Inventory
          </Link>
          <Link href="/dashboard/qc" className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2">
            <span>🛡️</span> QC Viewer
          </Link>
          <Link href="/dashboard/support" className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2">
            <span>🎧</span> Support
          </Link>
        </div>

        {/* Inventory Table Container */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-2xl">
          <div className="p-6 sm:p-8 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Warehouse Inventory (Real Data)</h2>
              <p className="text-slate-400 text-sm mt-1">ଗබඩාවට ලැබී ඇති ඔබේ පාර්සල් ලැයිස්තුව. එකට ඇසුරුම් කිරීමට පාර්සල් තෝරන්න.</p>
            </div>
            <button 
              onClick={handleConsolidateRequest}
              disabled={selectedPackages.length < 2}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-sm font-bold px-6 py-3 rounded-xl transition shadow-lg"
            >
              📦 Consolidate Selected ({selectedPackages.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-5 text-center w-16">Select</th>
                  <th className="p-5">Local Tracking No.</th>
                  <th className="p-5">Courier Name</th>
                  <th className="p-5">Weight (KG)</th>
                  <th className="p-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      ගබඩාවට ලැබුණු පාර්සල් කිහිපයක් තවම නොමැත. (No packages found in inventory).
                    </td>
                  </tr>
                ) : (
                  packages.map((pkg) => (
                    <tr key={pkg.id} className={`hover:bg-white/5 transition ${selectedPackages.includes(pkg.id) ? 'bg-blue-500/10' : ''}`}>
                      <td className="p-5 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedPackages.includes(pkg.id)} 
                          onChange={() => togglePackageSelection(pkg.id)}
                          disabled={pkg.status !== "In Warehouse" && pkg.status !== "Expected"}
                          className="w-5 h-5 rounded bg-black/50 border-white/20 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                        />
                      </td>
                      <td className="p-5 font-mono text-slate-200 font-bold">{pkg.local_tracking_number || "N/A"}</td>
                      <td className="p-5 text-slate-300">{pkg.courier_name || "SF Express"}</td>
                      <td className="p-5 text-slate-300 font-medium">{pkg.weight_kg ? `${pkg.weight_kg} KG` : "Pending"}</td>
                      <td className="p-5">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          pkg.status === 'In Warehouse' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {pkg.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}