 "use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardOverview() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [trackingNo, setTrackingNo] = useState("");
  const [weight, setWeight] = useState("");
  const [cbm, setCbm] = useState("");

  const estimatedAir = weight ? (parseFloat(weight) * 4.5).toFixed(2) : "0.00";
  const estimatedSea = cbm ? (parseFloat(cbm) * 120).toFixed(2) : "0.00";

  useEffect(() => {
    const fetchRealData = async () => {
      // 1. Get authenticated user from Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // 2. Fetch real profile data (SWIFT Code, etc.) from Supabase 'profiles' table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }
    };

    fetchRealData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const copyAddress = () => {
    if (!profile) return;
    const addressText = `Name: ${profile.swift_code}\nAddress: No. 123, Guangzhou Logistics Park, Baiyun District, Guangzhou, China.\nPhone: +86 138 0000 0000`;
    navigator.clipboard.writeText(addressText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNo) return;

    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: trackingNo, courier: 'SF Express' })
      });
      const result = await res.json();
      
      if (result.success) {
        const lastCheckpoint = result.data.checkpoints[result.data.checkpoints.length - 1];
        alert(`Tracking Status: ${result.data.status} | Last Location: ${lastCheckpoint ? lastCheckpoint.location : 'N/A'}`);
      } else {
        alert("Tracking failed: " + result.error);
      }
    } catch (err: any) {
      alert("Error tracking package: " + err.message);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1120] text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm tracking-widest uppercase">Loading Real Data...</p>
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

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
            <span className="text-xs text-slate-400">Account:</span>
            <span className="text-sm font-bold text-emerald-400">Active</span>
          </div>
          <span className="text-sm font-bold bg-blue-600 text-white px-3 py-1 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]">
            {profile.swift_code}
          </span>
          <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-white transition">
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Sub Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit mb-8 border border-white/5 backdrop-blur-md overflow-x-auto">
          <Link href="/dashboard" className="px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white shadow-lg shadow-blue-900/50 flex items-center gap-2">
            <span>📊</span> Overview
          </Link>
          <Link href="/dashboard/inventory" className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2">
            <span>📦</span> Inventory
          </Link>
          <Link href="/dashboard/qc" className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2">
            <span>🛡️</span> QC Viewer
          </Link>
          <Link href="/dashboard/invoices" className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2">
            <span>📄</span> Invoices
          </Link>
          <Link href="/dashboard/live-audit" className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2">
            <span>🔴</span> Live Audit
          </Link>
          <Link href="/dashboard/support" className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2">
            <span>🎧</span> Support
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* Global Tracking Card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-2">Track Global Package 🌍</h2>
              <p className="text-slate-400 text-sm mb-6">SF Express, ZTO හෝ වෙනත් කුරියර් ට්‍රැකින් අංකයක් ඇතුළත් කරන්න.</p>
              <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)} required
                  placeholder="Enter tracking number..." 
                  className="flex-1 bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-mono"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-md">
                  Track Now
                </button>
              </form>
            </div>

            {/* Virtual Warehouse Address (Real Database Data) */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Your Real China Warehouse Address</h2>
                  <p className="text-slate-400 text-sm mt-1">Taobao / 1688 හි ඇණවුම් කරන විට මෙම නම සහ ලිපිනය භාවිතා කරන්න.</p>
                </div>
                <button onClick={copyAddress} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-2">
                  {copied ? "✓ Copied!" : "📋 Copy Address"}
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="text-slate-400 text-sm">Receiver Name (SWIFT Code):</span>
                  <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg text-base">{profile.swift_code}</span>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="text-slate-400 text-sm">China Address:</span>
                  <span className="font-medium text-slate-200 text-right">No. 123, Guangzhou Logistics Park, Baiyun District, Guangzhou, China.</span>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="text-slate-400 text-sm">Account Email:</span>
                  <span className="font-medium text-slate-300">{user.email}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Calculator */}
          <div className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
              <h3 className="font-bold text-lg text-white mb-6">Instant Shipping Calculator 🧮</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Weight (KG)</label>
                  <input 
                    type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 10" 
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Volume (CBM)</label>
                  <input 
                    type="number" value={cbm} onChange={(e) => setCbm(e.target.value)} placeholder="e.g. 1.2" 
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-sm text-slate-300">✈️ Air Freight</span>
                  <span className="font-bold text-blue-400 text-lg">${estimatedAir}</span>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-sm text-slate-300">🚢 Sea Freight</span>
                  <span className="font-bold text-emerald-400 text-lg">${estimatedSea}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}