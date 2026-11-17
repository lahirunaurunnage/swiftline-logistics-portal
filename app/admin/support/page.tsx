 'use client';
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminSupportHub() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Ticket Detail Modal States
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // Support Settings Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoAssign, setAutoAssign] = useState(true);
  const [supportEmail, setSupportEmail] = useState('support@swiftline.app');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchAdminTickets();
  }, []);

  useEffect(() => {
    let result = tickets;

    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        (t.subject && t.subject.toLowerCase().includes(q)) || 
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.profiles?.swift_code && t.profiles.swift_code.toLowerCase().includes(q))
      );
    }

    setFilteredTickets(result);
  }, [searchQuery, statusFilter, tickets]);

  const fetchAdminTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (!profile || profile.role !== "admin") {
        alert("Access denied! Admin role required.");
        return router.push("/dashboard");
      }

      const { data, error } = await supabase
        .from("tickets")
        .select("*, profiles(swift_code, email)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setTickets(data);
        setFilteredTickets(data);
      }
    } catch (err: any) {
      console.error('Error fetching support tickets:', err.message);
    } finally {
      setLoading(false);
    }
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
      fetchAdminTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    }
  };

  const handleSaveSupportSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setTimeout(() => {
      alert("Support hub configurations & settings updated successfully!");
      setSavingSettings(false);
      setIsSettingsOpen(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans flex flex-col md:flex-row selection:bg-red-500 selection:text-white relative">
      
      {/* ---------------- SUPPORT SETTINGS MODAL ---------------- */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#060913] border border-blue-500/40 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-white">Support Hub Settings 🛠️</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white font-bold text-xl cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleSaveSupportSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Support Desk Email</label>
                <input type="email" required value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-3 font-mono" />
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Auto-Assign Tickets</h4>
                  <p className="text-[10px] text-slate-400">Route incoming client tickets automatically.</p>
                </div>
                <input type="checkbox" checked={autoAssign} onChange={(e) => setAutoAssign(e.target.checked)} className="w-5 h-5 rounded text-red-600 bg-black/50 border-white/10 cursor-pointer" />
              </div>
              <button type="submit" disabled={savingSettings} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition mt-2 cursor-pointer">
                {savingSettings ? 'Saving...' : 'Save Support Settings 🚀'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- TICKET DETAIL VIEW MODAL ---------------- */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#060913] border border-blue-500/40 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <span className="bg-blue-500/20 text-blue-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border border-blue-500/30">
                  Support Ticket #{selectedTicket.id.slice(0, 8)}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedTicket.subject}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white font-bold text-2xl cursor-pointer">&times;</button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="bg-black/40 p-4 rounded-2xl border border-white/10 space-y-2">
                <p className="text-slate-400">Client SWIFT Code: <span className="text-blue-400 font-bold">{selectedTicket.profiles?.swift_code || 'N/A'}</span></p>
                <p className="text-slate-400">Client Email: <span className="text-white font-bold">{selectedTicket.profiles?.email || 'N/A'}</span></p>
                <p className="text-slate-400">Created Date: <span className="text-white">{new Date(selectedTicket.created_at || Date.now()).toLocaleString()}</span></p>
                <p className="text-slate-400">Current Status: <span className="text-emerald-400 font-bold">{selectedTicket.status}</span></p>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-400 font-bold uppercase">Issue Description / Inquiry</label>
                <div className="bg-black/50 border border-white/10 p-4 rounded-2xl text-slate-300 font-sans text-sm leading-relaxed">
                  {selectedTicket.description}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => updateTicketStatus(selectedTicket.id, "In Progress")}
                className="flex-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white font-bold py-3 rounded-xl transition text-xs cursor-pointer"
              >
                Mark In Progress 🔄
              </button>
              <button 
                onClick={() => updateTicketStatus(selectedTicket.id, "Resolved")}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition text-xs cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                Mark Resolved ✅
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- FULL ADMIN SIDEBAR NAVIGATION ---------------- */}
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
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition">
            <span>⚙️</span> Analytics Dashboard
          </Link>
          <Link href="/admin/support" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-600/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Admin HQ: Support & Returns Hub 👑🎧</h1>
            <p className="text-sm text-slate-400 mt-1">Manage client inquiries, dispute issues, and return requests in real-time.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSettingsOpen(true)} className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition border border-blue-500/30 cursor-pointer">
              Support Settings ⚙️
            </button>
            <span className="bg-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-full text-xs font-bold border border-emerald-500/30 hidden sm:flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Support Online 🟢
            </span>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
              <div>
                <h2 className="text-base font-bold text-white">All Client Support Tickets ({filteredTickets.length})</h2>
                <p className="text-xs text-slate-400 mt-0.5">Click on any ticket row to inspect full details and manage status.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-black/40 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Search tickets or SWIFT..." 
                  className="w-full sm:w-64 bg-black/40 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase">
                    <th className="py-3 px-3">Client (SWIFT)</th>
                    <th className="py-3 px-3">Subject</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 font-sans">
                        කිසිදු Support Ticket එකක් ලැබී නොමැත. (No support tickets found).
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((t) => (
                      <tr key={t.id} onClick={() => setSelectedTicket(t)} className="hover:bg-white/[0.02] cursor-pointer transition">
                        <td className="py-4 px-3 font-bold text-blue-400">
                          {t.profiles?.swift_code || "Client"}
                          <div className="text-[10px] text-slate-400 font-normal">{new Date(t.created_at || Date.now()).toLocaleDateString()}</div>
                        </td>
                        <td className="py-4 px-3 font-bold text-white">{t.subject}</td>
                        <td className="py-4 px-3 text-slate-300 max-w-xs truncate font-sans">{t.description}</td>
                        <td className="py-4 px-3">
                          <span className={`px-2.5 py-1 rounded-full border text-[10px] font-sans font-bold ${
                            t.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            t.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => updateTicketStatus(t.id, "In Progress")}
                            className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            In Progress 🔄
                          </button>
                          <button 
                            onClick={() => updateTicketStatus(t.id, "Resolved")}
                            className="bg-emerald-600/20 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition cursor-pointer"
                          >
                            Resolve ✅
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}