 "use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminMainDashboard() {
  const [stats, setStats] = useState({
    totalPackages: 0,
    totalTickets: 0,
    totalInspections: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // ඩේටාබේස් එකෙන් වගු වල දත්ත ගණන (Counts) ලබා ගැනීම
      const { count: pkgCount } = await supabase.from("packages").select("*", { count: "exact", head: true });
      const { count: ticketCount } = await supabase.from("tickets").select("*", { count: "exact", head: true });
      const { count: qcCount } = await supabase.from("inspections").select("*", { count: "exact", head: true });
      const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });

      setStats({
        totalPackages: pkgCount || 0,
        totalTickets: ticketCount || 0,
        totalInspections: qcCount || 0,
        totalUsers: userCount || 0
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-[#0B1120] border-r border-white/10 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">W</div>
          <div className="text-xl font-bold tracking-tight text-white">Swiftline<span className="text-red-500">.</span> WMS</div>
        </div>
        <nav className="space-y-2 flex-1">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white text-sm font-medium"><span>📊</span> Admin Overview</Link>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white text-sm font-medium"><span>📟</span> Inbound Scanner</Link>
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
            <h1 className="text-2xl font-bold text-white">Admin Control Center</h1>
            <p className="text-sm text-slate-400">Guangzhou Central Operations & Analytics</p>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">System Online 🟢</span>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-[#0B1120] border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="text-slate-400 text-sm font-medium mb-1">Total Registered Clients</div>
            <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
          </div>
          <div className="bg-[#0B1120] border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="text-slate-400 text-sm font-medium mb-1">Warehouse Packages</div>
            <div className="text-3xl font-bold text-blue-400">{stats.totalPackages}</div>
          </div>
          <div className="bg-[#0B1120] border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="text-slate-400 text-sm font-medium mb-1">QC Audits Requested</div>
            <div className="text-3xl font-bold text-purple-400">{stats.totalInspections}</div>
          </div>
          <div className="bg-[#0B1120] border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="text-slate-400 text-sm font-medium mb-1">Support Tickets</div>
            <div className="text-3xl font-bold text-yellow-400">{stats.totalTickets}</div>
          </div>
        </div>

        {/* Quick Actions / Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin" className="bg-[#0B1120] border border-white/10 rounded-3xl p-8 hover:border-red-500/50 transition group">
            <div className="text-4xl mb-4">📟</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition">Inbound Scanner ➔</h3>
            <p className="text-slate-400 text-sm">Scan and register incoming Taobao/1688 packages into the warehouse system.</p>
          </Link>

          <Link href="/admin/consolidation" className="bg-[#0B1120] border border-white/10 rounded-3xl p-8 hover:border-blue-500/50 transition group">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition">Consolidation Hub ➔</h3>
            <p className="text-slate-400 text-sm">Process client package bundling requests and update final weights.</p>
          </Link>

          <Link href="/admin/qc" className="bg-[#0B1120] border border-white/10 rounded-3xl p-8 hover:border-purple-500/50 transition group">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition">Smart AI QC ➔</h3>
            <p className="text-slate-400 text-sm">Generate professional PDF inspection reports using AI from factory notes.</p>
          </Link>
        </div>

      </main>
    </div>
  );
}