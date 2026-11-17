 'use client';
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminClientsLedgerPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Selected Clients for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Manual Balance Adjustment Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('credit'); 
  const [adjustmentNote, setAdjustmentNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Client Details Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [clientDetails, setClientDetails] = useState<any>(null);
  const [clientTransactions, setClientTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchAdminClientsData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredClients(
        clients.filter(c => 
          (c.email && c.email.toLowerCase().includes(q)) || 
          (c.swift_code && c.swift_code.toLowerCase().includes(q)) ||
          (c.full_name && c.full_name.toLowerCase().includes(q))
        )
      );
    }
  }, [searchQuery, clients]);

  const fetchAdminClientsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (!profile || profile.role !== "admin") {
        alert("Access denied! Admin role required.");
        return router.push("/dashboard");
      }

      const { data: clientsData, error: clientErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "client")
        .order("created_at", { ascending: false });

      if (clientErr) throw clientErr;
      if (clientsData) {
        setClients(clientsData);
        setFilteredClients(clientsData);
      }

    } catch (err: any) {
      console.error('Error fetching client accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (clientId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", clientId);

    if (!error) {
      setMessage(`Client account status successfully updated to ${newStatus}!`);
      fetchAdminClientsData();
      setTimeout(() => setMessage(''), 3000);
    } else {
      alert("Failed to update status: " + error.message);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredClients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredClients.map(c => c.id));
    }
  };

  const toggleSelectClient = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const openAdjustmentModal = (client: any) => {
    setSelectedClient(client);
    setAdjustmentAmount('');
    setAdjustmentType('credit');
    setAdjustmentNote('');
    setIsModalOpen(true);
  };

  const openClientDrawer = async (client: any) => {
    setClientDetails(client);
    setIsDrawerOpen(true);

    const { data: txs } = await supabase
      .from("payout_history")
      .select("*")
      .eq("inspector_id", client.id)
      .order("created_at", { ascending: false });

    setClientTransactions(txs || []);
  };

  const handleBalanceAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !adjustmentAmount) return;

    setSubmitting(true);
    try {
      const currentBalance = selectedClient.wallet_balance || 0;
      const amount = parseFloat(adjustmentAmount);
      const newBalance = adjustmentType === 'credit' ? currentBalance + amount : currentBalance - amount;

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", selectedClient.id);

      if (updateErr) throw updateErr;

      await supabase.from("payout_history").insert([
        {
          inspector_id: selectedClient.id,
          inspector_name: selectedClient.email || 'Client',
          amount: amount,
          bank_name: `Admin Manual Adjustment (${adjustmentType.toUpperCase()})`,
          account_no: 'SYSTEM-LEDGER',
          holder_name: adjustmentNote || 'Admin Manual Override',
          status: 'Completed'
        }
      ]);

      setMessage(`Successfully adjusted wallet balance for ${selectedClient.email}!`);
      setIsModalOpen(false);
      fetchAdminClientsData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      alert("Error adjusting balance: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const exportLedgerCSV = () => {
    const headers = ["Client ID", "Email", "Swift Code", "Status", "Wallet Balance (USD)", "Joined Date"];
    const rows = clients.map(c => [
      c.id,
      c.email || '',
      c.swift_code || '',
      c.status || 'Active',
      c.wallet_balance || 0,
      c.created_at || ''
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Swiftline_Clients_Ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations for Summary Cards
  const totalClientsCount = clients.length;
  const activeClientsCount = clients.filter(c => (c.status || 'Active') === 'Active').length;
  const totalSystemBalance = clients.reduce((acc, c) => acc + (c.wallet_balance || 0), 0);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans flex flex-col md:flex-row selection:bg-red-500 selection:text-white relative">
      
      {/* ---------------- MANUAL BALANCE ADJUSTMENT MODAL ---------------- */}
      {isModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#060913] border border-blue-500/40 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-white">Manual Balance Adjustment 💳</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-xl cursor-pointer">&times;</button>
            </div>
            <div className="bg-black/40 p-3 rounded-xl border border-white/10 text-xs space-y-1">
              <p className="text-slate-400">Client: <span className="text-white font-bold">{selectedClient.email}</span></p>
              <p className="text-slate-400">Current Balance: <span className="text-emerald-400 font-bold font-mono">${(selectedClient.wallet_balance || 0).toFixed(2)} USD</span></p>
            </div>
            <form onSubmit={handleBalanceAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Adjustment Type</label>
                <select value={adjustmentType} onChange={(e) => setAdjustmentType(e.target.value)} className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-3">
                  <option value="credit">Credit / Add Funds 🟢</option>
                  <option value="debit">Debit / Deduct Funds 🔴</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Amount (USD)</label>
                <input type="number" step="0.01" required value={adjustmentAmount} onChange={(e) => setAdjustmentAmount(e.target.value)} placeholder="0.00" className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-3 font-mono" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Audit Note / Reason</label>
                <input type="text" required value={adjustmentNote} onChange={(e) => setAdjustmentNote(e.target.value)} placeholder="e.g. Shipment compensation / Bonus" className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-3" />
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-xl transition mt-2 cursor-pointer">
                {submitting ? 'Processing...' : 'Confirm Ledger Adjustment 🚀'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- CLIENT DETAILS SLIDE-OVER DRAWER ---------------- */}
      {isDrawerOpen && clientDetails && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="bg-[#060913] border-l border-white/10 w-full max-w-lg h-full p-6 sm:p-8 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <span className="bg-blue-500/20 text-blue-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border border-blue-500/30">
                  Client Profile 👤
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{clientDetails.email}</h3>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-white font-bold text-2xl cursor-pointer">&times;</button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded-2xl border border-white/10 text-xs font-mono">
              <div>
                <p className="text-slate-400">Swift Code:</p>
                <p className="text-blue-400 font-bold">{clientDetails.swift_code || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400">Wallet Balance:</p>
                <p className="text-emerald-400 font-bold">${(clientDetails.wallet_balance || 0).toFixed(2)} USD</p>
              </div>
              <div>
                <p className="text-slate-400">Status:</p>
                <p className="text-emerald-400 font-bold">{clientDetails.status || 'Active'}</p>
              </div>
              <div>
                <p className="text-slate-400">Joined Date:</p>
                <p className="text-white">{new Date(clientDetails.created_at || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Transaction Ledger History 📜</h4>
              <div className="space-y-2">
                {clientTransactions.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono py-4 text-center">No transactions recorded for this client yet.</p>
                ) : (
                  clientTransactions.map(tx => (
                    <div key={tx.id} className="bg-black/50 border border-white/10 p-3 rounded-xl text-xs space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-blue-400 font-bold">{tx.bank_name}</span>
                        <span className="text-emerald-400 font-bold">${(tx.amount || 0).toFixed(2)} USD</span>
                      </div>
                      <p className="text-slate-400 text-[10px]">Note: {tx.holder_name}</p>
                      <p className="text-slate-500 text-[10px]">{new Date(tx.created_at || Date.now()).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
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
          <Link href="/admin/clients" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-600/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
            <span>👥</span> Client Accounts & Ledger
          </Link>
          <Link href="/admin/carriers" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition">
            <span>🌐</span> Carrier Management
          </Link>
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition">
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
            Log Out
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto space-y-10">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Admin HQ: Client Accounts & Financial Ledger 👑👥</h1>
            <p className="text-sm text-slate-400 mt-1">Manage global sourcing clients, live wallet balances, manual balance adjustments, and CSV exports.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportLedgerCSV} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-[0_0_15px_rgba(147,51,234,0.3)] cursor-pointer">
              Export Ledger CSV 📊
            </button>
            <span className="bg-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-full text-xs font-bold border border-emerald-500/30 hidden sm:flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Active 🟢
            </span>
          </div>
        </header>

        {/* Summary Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 border border-white/10 p-6 rounded-3xl shadow-xl space-y-2">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Registered Clients</p>
            <p className="text-2xl font-extrabold text-white font-mono">{totalClientsCount}</p>
          </div>
          <div className="bg-slate-900/90 border border-white/10 p-6 rounded-3xl shadow-xl space-y-2">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Client Accounts</p>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono">{activeClientsCount}</p>
          </div>
          <div className="bg-slate-900/90 border border-white/10 p-6 rounded-3xl shadow-xl space-y-2">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total System Wallet Balance</p>
            <p className="text-2xl font-extrabold text-blue-400 font-mono">${totalSystemBalance.toFixed(2)} USD</p>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className="p-4 rounded-2xl border text-sm font-medium bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
              <div>
                <h2 className="text-base font-bold text-white">👥 Registered Client Directory & Financial Ledger ({filteredClients.length})</h2>
                <p className="text-xs text-slate-400 mt-0.5">Click on any client email to view full profile & transaction history drawer.</p>
              </div>
              <div className="w-full sm:w-72">
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Search by email or swift code..." 
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase">
                    <th className="py-3 px-3 w-10">
                      <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === filteredClients.length && filteredClients.length > 0} className="cursor-pointer rounded bg-black/50 border-white/10" />
                    </th>
                    <th className="py-3 px-3">Client Email / ID</th>
                    <th className="py-3 px-3">Swift Code</th>
                    <th className="py-3 px-3">Account Status</th>
                    <th className="py-3 px-3">Wallet / Credit Balance</th>
                    <th className="py-3 px-3 text-right">Actions (Adjust / Suspend)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredClients.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-slate-500 font-sans">No client accounts found matching your search.</td></tr>
                  ) : (
                    filteredClients.map((client) => {
                      const status = client.status || 'Active';
                      const isSelected = selectedIds.includes(client.id);
                      return (
                        <tr key={client.id} className={`hover:bg-white/[0.02] ${isSelected ? 'bg-white/[0.04]' : ''}`}>
                          <td className="py-4 px-3">
                            <input type="checkbox" checked={isSelected} onChange={() => toggleSelectClient(client.id)} className="cursor-pointer rounded bg-black/50 border-white/10" />
                          </td>
                          <td className="py-4 px-3 font-bold text-white">
                            <button onClick={() => openClientDrawer(client)} className="text-blue-400 hover:underline text-left cursor-pointer font-bold">
                              {client.email || client.id}
                            </button>
                            <div className="text-[10px] text-slate-400 font-normal">Joined: {new Date(client.created_at || Date.now()).toLocaleDateString()}</div>
                          </td>
                          <td className="py-4 px-3 text-blue-400">{client.swift_code || 'SWIFT-XXXX'}</td>
                          <td className="py-4 px-3">
                            <span className={`px-2.5 py-1 rounded-full border text-[10px] ${status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                              {status}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-emerald-400 font-bold">${(client.wallet_balance || 0).toFixed(2)} USD</td>
                          <td className="py-4 px-3 text-right space-x-2">
                            <button 
                              onClick={() => openAdjustmentModal(client)}
                              className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg transition text-[10px] font-bold cursor-pointer"
                            >
                              Adjust Balance 💳
                            </button>
                            <button 
                              onClick={() => handleToggleStatus(client.id, status)}
                              className={`font-bold px-3 py-1.5 rounded-lg transition text-[10px] cursor-pointer ${status === 'Active' ? 'bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                            >
                              {status === 'Active' ? 'Suspend ⛔' : 'Activate ✅'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
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