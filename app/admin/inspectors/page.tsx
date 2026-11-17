 'use client';
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminInspectorsManagementPage() {
  const router = useRouter();
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [inspectorJobs, setInspectorJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Edit Modal States
  const [editingInspector, setEditingInspector] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editZone, setEditZone] = useState('');

  // New Inspector Onboarding Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [zone, setZone] = useState('Guangzhou Zone A');

  useEffect(() => {
    fetchAdminInspectorData();
  }, []);

  const fetchAdminInspectorData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (!profile || profile.role !== "admin") {
        alert("Access denied! Admin role required.");
        return router.push("/dashboard");
      }

      // 1. Fetch Inspectors List
      const { data: insData, error: insErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "inspector")
        .order("created_at", { ascending: false });

      if (insErr) throw insErr;
      if (insData) {
        setPendingApplications(insData.filter(i => i.status === "Pending Approval"));
        setInspectors(insData.filter(i => i.status === "Active" || i.status === "Approved"));
      }

      // 2. Fetch All QC Jobs assigned to inspectors for Admin tracking
      const { data: jobData, error: jobErr } = await supabase
        .from("qc_jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (jobErr) throw jobErr;
      if (jobData) setInspectorJobs(jobData);

    } catch (err: any) {
      console.error('Error fetching admin inspector data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const { error } = await supabase.from("profiles").insert([
        {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          warehouse_location: zone,
          role: 'inspector',
          status: 'Active',
          wallet_balance: 0
        }
      ]);

      if (error) throw error;

      setMessage('success: Inspector successfully registered and assigned to ' + zone + '!');
      setFullName('');
      setEmail('');
      setPhone('');
      fetchAdminInspectorData();
    } catch (err: any) {
      setMessage('error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Approve Landing Page / Portal Registration
  const handleApproveApplication = async (inspectorId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ status: "Active" })
      .eq("id", inspectorId);

    if (!error) {
      alert("Inspector application approved successfully!");
      fetchAdminInspectorData();
    } else {
      alert("Failed to approve: " + error.message);
    }
  };

  // Delete / Reject Inspector
  const handleDeleteInspector = async (inspectorId: string) => {
    if (!confirm("Are you sure you want to delete/reject this inspector?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", inspectorId);

    if (!error) {
      alert("Inspector account removed successfully.");
      fetchAdminInspectorData();
    } else {
      alert("Failed to delete inspector: " + error.message);
    }
  };

  // Open Edit Modal
  const openEditModal = (ins: any) => {
    setEditingInspector(ins);
    setEditName(ins.full_name || '');
    setEditPhone(ins.phone || '');
    setEditZone(ins.warehouse_location || 'Guangzhou Zone A');
  };

  // Save Edited Inspector Details
  const handleUpdateInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInspector) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editName.trim(),
        phone: editPhone.trim(),
        warehouse_location: editZone
      })
      .eq("id", editingInspector.id);

    if (!error) {
      alert("Inspector details updated successfully!");
      setEditingInspector(null);
      fetchAdminInspectorData();
    } else {
      alert("Failed to update: " + error.message);
    }
  };

  // Manual Job Re-assignment Handler
  const handleReassignJob = async (jobId: string, newInspectorId: string) => {
    if (!newInspectorId) return;
    const { error } = await supabase
      .from("qc_jobs")
      .update({ inspector_id: newInspectorId, status: "In Progress" })
      .eq("job_id", jobId);

    if (!error) {
      alert(`Job ${jobId} successfully re-assigned to new inspector!`);
      fetchAdminInspectorData();
    } else {
      alert("Failed to re-assign job: " + error.message);
    }
  };

  // Approve Payout / Withdrawal Request
  const handleApprovePayout = async (inspectorId: string, currentBalance: number) => {
    if (currentBalance <= 0) {
      alert("No balance available for payout.");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ wallet_balance: 0 })
      .eq("id", inspectorId);

    if (!error) {
      alert(`Successfully paid out $${currentBalance.toFixed(2)} USD to inspector wallet! Payout recorded.`);
      fetchAdminInspectorData();
    } else {
      alert("Failed to process payout: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans flex flex-col md:flex-row selection:bg-red-500 selection:text-white relative">
      
      {/* ---------------- EDIT INSPECTOR MODAL ---------------- */}
      {editingInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#060913] border border-blue-500/40 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-white">Edit Inspector Details ✏️</h3>
              <button onClick={() => setEditingInspector(null)} className="text-slate-400 hover:text-white font-bold text-xl cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleUpdateInspector} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Full Name</label>
                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Phone Number</label>
                <input type="text" required value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-3 font-mono" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Warehouse Zone</label>
                <select value={editZone} onChange={(e) => setEditZone(e.target.value)} className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-3">
                  <option value="Guangzhou Zone A">Guangzhou Zone A (Electronics)</option>
                  <option value="Guangzhou Zone B">Guangzhou Zone B (Apparel)</option>
                  <option value="Guangzhou Zone C">Guangzhou Zone C (General Cargo)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition mt-2 cursor-pointer">
                Save Changes 🚀
              </button>
            </form>
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
          <Link href="/admin/inspectors" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-600/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
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
        
        <header className="flex justify-between items-center bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Admin HQ: Inspector Management & Oversight 👑🕵️‍♂️</h1>
            <p className="text-sm text-slate-400 mt-1">Review pending applications & CVs, edit profiles, manage payouts, and re-assign jobs.</p>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-500/30 hidden sm:flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Admin HQ Active 🟢
          </span>
        </header>

        {/* Message Alert */}
        {message && (
          <div className={`p-4 rounded-2xl border text-sm font-medium ${message.startsWith("success") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {message.replace(/^(success|error):\s*/, "")}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="space-y-10">
            
            {/* ---------------- PENDING INSPECTOR APPLICATIONS (WITH CV) ---------------- */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-orange-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="border-b border-white/10 pb-4 flex justify-between items-center">
                <div>
                  <span className="bg-orange-500/20 text-orange-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border border-orange-500/30">
                    Action Required ⚠️
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1">Pending Inspector Applications & CVs ({pendingApplications.length})</h2>
                </div>
                <button onClick={fetchAdminInspectorData} className="text-xs font-mono text-orange-400 hover:underline cursor-pointer">Refresh 🔄</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase">
                      <th className="py-3 px-3">Full Name</th>
                      <th className="py-3 px-3">Zone / Experience</th>
                      <th className="py-3 px-3">Specialization</th>
                      <th className="py-3 px-3">CV / Resume</th>
                      <th className="py-3 px-3 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pendingApplications.length === 0 ? (
                      <tr><td colSpan={5} className="py-6 text-center text-slate-500 font-sans">No pending inspector applications.</td></tr>
                    ) : (
                      pendingApplications.map(app => (
                        <tr key={app.id} className="hover:bg-white/[0.02]">
                          <td className="py-4 px-3 font-bold text-white">
                            {app.full_name || 'N/A'}
                            <div className="text-[10px] text-slate-400 font-normal">{app.email}</div>
                          </td>
                          <td className="py-4 px-3 text-blue-400">
                            {app.warehouse_location || 'Zone A'}
                            <div className="text-[10px] text-slate-400">{app.experience_years || 'N/A'} exp</div>
                          </td>
                          <td className="py-4 px-3 text-slate-300">{app.specialization || 'General QC'}</td>
                          <td className="py-4 px-3">
                            {app.cv_url ? (
                              <a href={app.cv_url} target="_blank" rel="noopener noreferrer" className="bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white px-3 py-1.5 rounded-lg transition text-[10px] font-bold inline-block">
                                View CV 📄
                              </a>
                            ) : (
                              <span className="text-slate-500">No CV</span>
                            )}
                          </td>
                          <td className="py-4 px-3 text-right space-x-2">
                            <button onClick={() => handleApproveApplication(app.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition cursor-pointer">
                              Approve ✅
                            </button>
                            <button onClick={() => handleDeleteInspector(app.id)} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold px-3 py-1.5 rounded-lg text-[10px] transition cursor-pointer">
                              Reject ❌
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Onboard New Inspector Form */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="bg-red-500/20 text-red-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border border-red-500/30">
                  Onboarding 🚀
                </span>
                <h2 className="text-lg font-bold text-white mt-1">Register New Warehouse Inspector Directly</h2>
              </div>

              <form onSubmit={handleAddInspector} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input 
                    type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                    placeholder="e.g. Inspector Chen" 
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="chen@swiftline.app" 
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <input 
                    type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required
                    placeholder="+86 138 0000 0000" 
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Warehouse Zone</label>
                  <select 
                    value={zone} onChange={(e) => setZone(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 text-xs"
                  >
                    <option value="Guangzhou Zone A">Guangzhou Zone A (Electronics)</option>
                    <option value="Guangzhou Zone B">Guangzhou Zone B (Apparel)</option>
                    <option value="Guangzhou Zone C">Guangzhou Zone C (General Cargo)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-4 pt-2">
                  <button 
                    type="submit" disabled={submitting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition shadow-[0_0_20px_rgba(220,38,38,0.5)] cursor-pointer text-xs uppercase tracking-wider"
                  >
                    {submitting ? 'Registering Inspector...' : 'Register Inspector & Assign Zone 🚀'}
                  </button>
                </div>
              </form>
            </div>

            {/* Active Inspectors Directory, Edit, Delete & Payout Ledger */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-base font-bold text-white">⭐ Active Inspectors Directory, Edit, Delete & Payout Ledger ({inspectors.length})</h2>
                <button onClick={fetchAdminInspectorData} className="text-xs font-mono text-red-400 hover:underline cursor-pointer">Refresh List 🔄</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase">
                      <th className="py-3 px-3">Inspector Name</th>
                      <th className="py-3 px-3">Assigned Zone</th>
                      <th className="py-3 px-3">CV File</th>
                      <th className="py-3 px-3">Wallet Balance</th>
                      <th className="py-3 px-3">Actions (Edit / Delete)</th>
                      <th className="py-3 px-3 text-right">Action / Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {inspectors.length === 0 ? (
                      <tr><td colSpan={6} className="py-8 text-center text-slate-500 font-sans">No active inspectors registered yet. Approve pending applications above.</td></tr>
                    ) : (
                      inspectors.map((ins) => {
                        const balance = ins.wallet_balance || 0;
                        return (
                          <tr key={ins.id} className="hover:bg-white/[0.02]">
                            <td className="py-4 px-3 font-bold text-white">
                              {ins.full_name || 'N/A'}
                              <div className="text-[10px] text-slate-400 font-normal">{ins.email}</div>
                            </td>
                            <td className="py-4 px-3 text-blue-400">{ins.warehouse_location || 'Guangzhou Zone A'}</td>
                            <td className="py-4 px-3">
                              {ins.cv_url ? (
                                <a href={ins.cv_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">View CV 📄</a>
                              ) : (
                                <span className="text-slate-500">N/A</span>
                              )}
                            </td>
                            <td className="py-4 px-3 text-emerald-400 font-bold">${balance.toFixed(2)} USD</td>
                            <td className="py-4 px-3 space-x-2">
                              <button onClick={() => openEditModal(ins)} className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-2.5 py-1 rounded-lg transition text-[10px] cursor-pointer">
                                Edit ✏️
                              </button>
                              <button onClick={() => handleDeleteInspector(ins.id)} className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-2.5 py-1 rounded-lg transition text-[10px] cursor-pointer">
                                Delete 🗑️
                              </button>
                            </td>
                            <td className="py-4 px-3 text-right">
                              <button 
                                onClick={() => handleApprovePayout(ins.id, balance)}
                                disabled={balance <= 0}
                                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold px-3 py-1.5 rounded-lg transition text-[10px] cursor-pointer"
                              >
                                {balance > 0 ? 'Approve Payout 💵' : 'No Balance'}
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

            {/* Field Inspection Jobs Delegation & GPS Zone Tracking */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-base font-bold text-white">🗺️ Field Jobs Delegation & Live GPS Zone Tracking ({inspectorJobs.length})</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase">
                      <th className="py-3 px-3">Job ID</th>
                      <th className="py-3 px-3">Product Name</th>
                      <th className="py-3 px-3">GPS Location Zone</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Re-assign Inspector</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {inspectorJobs.length === 0 ? (
                      <tr><td colSpan={5} className="py-6 text-center text-slate-500 font-sans">No inspection jobs found.</td></tr>
                    ) : (
                      inspectorJobs.map(job => (
                        <tr key={job.job_id} className="hover:bg-white/[0.02]">
                          <td className="py-4 px-3 font-bold text-white">{job.job_id}</td>
                          <td className="py-4 px-3 text-slate-300">{job.product_name}</td>
                          <td className="py-4 px-3 text-blue-400">📍 {job.location} (GPS Active 🟢)</td>
                          <td className="py-4 px-3">
                            <span className="bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-full border border-purple-500/20 font-sans text-[10px]">
                              {job.status}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-right">
                            <select 
                              onChange={(e) => handleReassignJob(job.job_id, e.target.value)}
                              defaultValue=""
                              className="bg-black/50 border border-white/10 text-white rounded-lg px-2 py-1 text-[10px] focus:outline-none focus:border-red-500 cursor-pointer"
                            >
                              <option value="" disabled>Re-assign Inspector...</option>
                              {inspectors.map(ins => (
                                <option key={ins.id} value={ins.id}>{ins.full_name}</option>
                              ))}
                            </select>
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