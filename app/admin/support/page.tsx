
"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminTickets();
  }, []);

  const fetchAdminTickets = async () => {
    // tickets වගුවෙන් සහ profiles වගුවෙන් (SWIFT කේතය සමඟ) දත්ත ලබා ගැනීම
    const { data, error } = await supabase
      .from("tickets")
      .select("*, profiles(swift_code)")
      .order("created_at", { ascending: false });

    if (data) {
      setTickets(data);
    }
    setLoading(false);
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    const { error } = await supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", ticketId);

    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      alert(`Ticket status updated to: ${newStatus}`);
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    }
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
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white text-sm font-medium"><span>📊</span> Admin Overview</Link>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white text-sm font-medium"><span>📟</span> Inbound Scanner</Link>
          <Link href="/admin/consolidation" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white text-sm font-medium"><span>📦</span> Consolidation Hub</Link>
          <Link href="/admin/qc" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white text-sm font-medium"><span>✨</span> Smart AI QC</Link>
          <Link href="/admin/support" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white text-sm font-medium"><span>🎧</span> Support Tickets</Link>
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
            <h1 className="text-2xl font-bold text-white">Support & Returns Hub</h1>
            <p className="text-sm text-slate-400">Manage client inquiries, issues, and return requests</p>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">System Online 🟢</span>
        </header>

        <div className="bg-[#0B1120] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-bold text-white">All Client Support Tickets</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-5 font-semibold">Client (SWIFT)</th>
                  <th className="p-5 font-semibold">Subject</th>
                  <th className="p-5 font-semibold">Description</th>
                  <th className="p-5 font-semibold">Status</th>
                  <th className="p-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      කිසිදු Support Ticket එකක් ලැබී නොමැත. (No support tickets found).
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition">
                      <td className="p-5 font-bold text-blue-400 font-mono">
                        {t.profiles?.swift_code || "Client"}
                      </td>
                      <td className="p-5 font-medium text-white">{t.subject}</td>
                      <td className="p-5 text-slate-300 max-w-xs truncate">{t.description}</td>
                      <td className="p-5">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          t.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          t.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-5 text-right space-x-2">
                        <button 
                          onClick={() => updateTicketStatus(t.id, "In Progress")}
                          className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                        >
                          In Progress
                        </button>
                        <button 
                          onClick={() => updateTicketStatus(t.id, "Resolved")}
                          className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                        >
                          Resolve
                        </button>
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