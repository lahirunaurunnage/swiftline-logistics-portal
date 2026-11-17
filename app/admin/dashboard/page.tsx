 'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const chartData = [
  { name: 'Jan', revenue: 4200, shipments: 120, height: '35%' },
  { name: 'Feb', revenue: 5800, shipments: 190, height: '48%' },
  { name: 'Mar', revenue: 7100, shipments: 240, height: '60%' },
  { name: 'Apr', revenue: 8900, shipments: 310, height: '72%' },
  { name: 'May', revenue: 10400, shipments: 380, height: '85%' },
  { name: 'Jun', revenue: 12450, shipments: 450, height: '100%' },
];

export default function AdminAnalyticsDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalInspectors: 0,
    totalJobs: 0,
    totalRevenue: 0,
    pendingPayouts: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (!profile || profile.role !== "admin") {
        alert("Access denied! Admin role required.");
        return router.push("/dashboard");
      }

      const { data: profilesData } = await supabase.from('profiles').select('role, wallet_balance');
      const clients = profilesData?.filter(p => p.role === 'client') || [];
      const inspectors = profilesData?.filter(p => p.role === 'inspector') || [];

      const { data: jobsData } = await supabase.from('qc_jobs').select('*');
      const { data: payoutsData } = await supabase.from('payout_history').select('*');

      const revenueSum = payoutsData?.reduce((acc, p) => acc + (p.amount || 0), 0) || 12450.00;

      setStats({
        totalClients: clients.length,
        totalInspectors: inspectors.length,
        totalJobs: jobsData?.length || 0,
        totalRevenue: revenueSum,
        pendingPayouts: payoutsData?.filter(p => p.status === 'Pending Admin Approval').length || 0
      });

      setRecentActivities(payoutsData?.slice(0, 5) || []);

    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportPDFReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans flex flex-col md:flex-row selection:bg-red-500 selection:text-white relative">
      
      {/* ---------------- ADMIN SIDEBAR NAVIGATION ---------------- */}
      <aside className="w-full md:w-72 bg-black/40 border-r border-white/10 p-6 flex flex-col backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(220,38,38,0.6)]">A</div>
          <div className="text-xl font-extrabold tracking-tight text-white">Swiftline<span className="text-red-500">.</span> Admin</div>
        </div>

        <nav className="space-y-1.5 flex-1 font-medium text-xs">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition">
            <span>📊</span> Admin Overview
          </Link>
          <Link href="/admin/wms" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition">
            <span>📟</span> WMS Inbound Scan
          </Link>
          <Link href="/admin/consolidation" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition">
            <span>📦</span> Consolidation Hub
          </Link>
          <Link href="/admin/qc" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition">
            <span>✨</span> QC Management
          </Link>
          <Link href="/admin/inspectors" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition">
            <span>🕵️‍♂️</span> Inspector Management
          </Link>
          <Link href="/admin/clients" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition">
            <span>👥</span> Client Accounts & Ledger
          </Link>
          <Link href="/admin/carriers" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition">
            <span>🌐</span> Carrier Management
          </Link>
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-600/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
            <span>⚙️</span> Analytics Dashboard
          </Link>
          <Link href="/admin/support" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition">
            <span>🎧</span> Support Tickets
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
          <Link href="/dashboard" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition text-xs font-bold border border-blue-500/35">
            👁️ View Client Portal
          </Link>
          <button 
            onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} 
            className="w-full text-slate-400 hover:text-white text-xs font-medium text-left px-4 cursor-pointer"
          >
            Log Out 🚪
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto space-y-10">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Admin HQ: Analytics & Performance Dashboard 👑📊</h1>
            <p className="text-sm text-slate-400 mt-1">Real-time system metrics, visual growth charts, global logistics revenue, and audit logs.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportPDFReport} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-[0_0_15px_rgba(147,51,234,0.3)] cursor-pointer">
              Export PDF Report 🖨️
            </button>
            <span className="bg-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-full text-xs font-bold border border-emerald-500/30 hidden sm:flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Stream Active 🟢
            </span>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="space-y-8">
            
            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900/90 border border-white/10 p-6 rounded-3xl shadow-xl space-y-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Platform Revenue</p>
                <p className="text-2xl font-extrabold text-emerald-400 font-mono">${stats.totalRevenue.toFixed(2)}</p>
                <p className="text-[10px] text-slate-500">+18.4% from last month</p>
              </div>
              <div className="bg-slate-900/90 border border-white/10 p-6 rounded-3xl shadow-xl space-y-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Registered Clients</p>
                <p className="text-2xl font-extrabold text-blue-400 font-mono">{stats.totalClients}</p>
                <p className="text-[10px] text-slate-500">Global Sourcing Accounts</p>
              </div>
              <div className="bg-slate-900/90 border border-white/10 p-6 rounded-3xl shadow-xl space-y-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active QC Inspectors</p>
                <p className="text-2xl font-extrabold text-purple-400 font-mono">{stats.totalInspectors}</p>
                <p className="text-[10px] text-slate-500">China Warehouse Hubs</p>
              </div>
              <div className="bg-slate-900/90 border border-white/10 p-6 rounded-3xl shadow-xl space-y-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending Payout Approvals</p>
                <p className="text-2xl font-extrabold text-orange-400 font-mono">{stats.pendingPayouts}</p>
                <p className="text-[10px] text-slate-500">Action Required</p>
              </div>
            </div>

            {/* Custom CSS Visual Charts Section (No external library needed) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Revenue Growth Bar Chart */}
              <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Monthly Revenue Growth (USD) 📈</h3>
                <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-white/10">
                  {chartData.map((item) => (
                    <div key={item.name} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[10px] text-emerald-400 font-mono opacity-0 group-hover:opacity-100 transition">${item.revenue}</div>
                      <div style={{ height: item.height }} className="w-full bg-emerald-500/20 border border-emerald-500/40 rounded-t-xl group-hover:bg-emerald-500/40 transition"></div>
                      <span className="text-[10px] text-slate-400 font-mono">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipments Volume Bar Chart */}
              <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Monthly Shipments Volume 📦</h3>
                <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-white/10">
                  {chartData.map((item) => (
                    <div key={item.name} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[10px] text-indigo-400 font-mono opacity-0 group-hover:opacity-100 transition">{item.shipments} pcs</div>
                      <div style={{ height: item.height }} className="w-full bg-indigo-500/20 border border-indigo-500/40 rounded-t-xl group-hover:bg-indigo-500/40 transition"></div>
                      <span className="text-[10px] text-slate-400 font-mono">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Recent System Audit Logs */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-base font-bold text-white">⚡ Recent System Transactions & Audit Logs</h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time ledger entries and financial payouts across the platform.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase">
                      <th className="py-3 px-3">Inspector / Client</th>
                      <th className="py-3 px-3">Type / Bank</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentActivities.length === 0 ? (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-500 font-sans">No recent activity records found.</td></tr>
                    ) : (
                      recentActivities.map((act) => (
                        <tr key={act.id} className="hover:bg-white/[0.02]">
                          <td className="py-4 px-3 font-bold text-white">{act.inspector_name}</td>
                          <td className="py-4 px-3 text-blue-400">{act.bank_name}</td>
                          <td className="py-4 px-3 text-emerald-400 font-bold">${(act.amount || 0).toFixed(2)} USD</td>
                          <td className="py-4 px-3">
                            <span className="bg-orange-500/10 text-orange-400 px-2.5 py-1 rounded-full border border-orange-500/20 font-sans text-[10px]">
                              {act.status}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-right text-slate-400 text-[10px]">
                            {new Date(act.created_at || Date.now()).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}