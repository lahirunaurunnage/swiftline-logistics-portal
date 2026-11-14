"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardQC() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQCData = async () => {
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

      // 3. Fetch Real Inspections from Supabase 'inspections' table
      const { data: qcData, error: qcError } = await supabase
        .from("inspections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (qcData) {
        setInspections(qcData);
      }
      setLoading(false);
    };

    fetchQCData();
  }, [router]);

  const handleQCAction = async (inspectionId: string, decision: string) => {
    // ඩේටාබේස් එකේ QC status එක යාවත්කාලීන කිරීම (Approved / Rejected)
    const { error } = await supabase
      .from("inspections")
      .update({ status: decision })
      .eq("id", inspectionId);

    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      alert(`Inspection successfully marked as: ${decision}!`);
      // Update local state
      setInspections(inspections.map(item => item.id === inspectionId ? { ...item, status: decision } : item));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1120] text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm tracking-widest uppercase">Loading QC Reports...</p>
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
          <Link href="/dashboard/inventory" className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2">
            <span>📦</span> Inventory
          </Link>
          <Link href="/dashboard/qc" className="px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white shadow-lg shadow-blue-900/50 flex items-center gap-2">
            <span>🛡️</span> QC Viewer
          </Link>
          <Link href="/dashboard/support" className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2">
            <span>🎧</span> Support
          </Link>
        </div>

        {/* QC Content Container */}
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Quality Control (QC) & Inspection Reports</h2>
            <p className="text-slate-400 text-sm mt-1">කර්මාන්තශාලා පරීක්ෂණ වාර්තා (QC Reports) පරීක්ෂා කර අනුමත කරන්න.</p>
          </div>

          {inspections.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-slate-400 backdrop-blur-md">
              <div className="text-5xl mb-4">🛡️</div>
              <p className="text-lg font-medium">කිසිදු QC වාර්තාවක් තවම ලැබී නොමැත.</p>
              <p className="text-sm text-slate-500 mt-1">No inspection reports found in your account.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {inspections.map((qc) => (
                <div key={qc.id} className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Fee: ${qc.fee_usd || "0.00"}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        qc.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        qc.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {qc.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">Inspection ID: {qc.id.slice(0, 8)}...</h3>
                    <p className="text-slate-400 text-sm mb-6">Date: {new Date(qc.created_at).toLocaleDateString()}</p>

                    {/* Report Link or Details */}
                    {qc.report_url ? (
                      <a href={qc.report_url} target="_blank" rel="noopener noreferrer" className="block bg-black/40 border border-white/10 p-4 rounded-xl text-blue-400 text-sm font-medium hover:bg-black/60 transition mb-6 text-center">
                        📄 View AI Generated PDF Report
                      </a>
                    ) : (
                      <div className="bg-black/40 border border-white/10 p-4 rounded-xl text-slate-400 text-sm mb-6 text-center">
                        Report processing in progress...
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-white/10">
                    <button 
                      onClick={() => handleQCAction(qc.id, "Approved")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-emerald-900/50 text-sm"
                    >
                      Approve & Ship
                    </button>
                    <button 
                      onClick={() => handleQCAction(qc.id, "Rejected")}
                      className="flex-1 bg-white/10 hover:bg-red-600 text-slate-300 hover:text-white font-bold py-3 rounded-xl transition text-sm"
                    >
                      Reject & Return
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}