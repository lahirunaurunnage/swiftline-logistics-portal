 "use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InvoicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoicesData = async () => {
      // 1. Check Auth User
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // 2. Fetch Profile Data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // 3. Fetch Invoices from Supabase
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (invoiceData) {
        setInvoices(invoiceData);
      } else {
        // Fallback sample mock invoice if database is empty yet
        setInvoices([
          {
            id: "INV-2026-001",
            title: "Guangzhou Cargo Air Shipping & QC Service",
            amount: 185.00,
            status: "Pending",
            created_at: "2026-11-12"
          }
        ]);
      }

      setLoading(false);
    };

    fetchInvoicesData();
  }, [router]);

  const handleStripePayment = async (amount: number, invoiceTitle: string) => {
    try {
      setPayingId(invoiceTitle);
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, itemName: invoiceTitle })
      });
      const result = await res.json();
      
      if (result.success && result.url) {
        window.location.href = result.url; // Redirect to Stripe Checkout
      } else {
        alert("Payment initiation failed: " + result.error);
        setPayingId(null);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
      setPayingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1120] text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm tracking-widest uppercase">Loading Invoices & Billing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-[#060913] border-r border-white/10 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">S</div>
          <div className="text-xl font-bold tracking-tight text-white">Swiftline<span className="text-blue-500">.</span></div>
        </div>

        <nav className="space-y-2 flex-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white font-medium text-sm transition">
            <span>📊</span> Overview
          </Link>
          <Link href="/dashboard/inventory" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white font-medium text-sm transition">
            <span>📦</span> Inventory & Consolidation
          </Link>
          <Link href="/dashboard/qc" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white font-medium text-sm transition">
            <span>✨</span> QC Reports & Approvals
          </Link>
          <Link href="/dashboard/invoices" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-600 text-white font-medium text-sm shadow-lg shadow-emerald-600/20">
            <span>📄</span> Commercial Invoices
          </Link>
          <Link href="/dashboard/live-audit" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white font-medium text-sm transition">
            <span>🔴</span> Live Audit
          </Link>
          <Link href="/dashboard/support" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white font-medium text-sm transition">
            <span>🎧</span> Support & Returns Hub
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Your SWIFT Code</div>
            <div className="text-lg font-mono font-bold text-blue-400">{profile?.swift_code || "SWIFT-XXXX"}</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-10 bg-[#060913]/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white">Commercial Invoices & Billing 📄</h1>
            <p className="text-sm text-slate-400 mt-1">රේගු සහ ගිණුම්කරණ ලේඛන බාගත කර Stripe හරහා ගෙවීම් කරන්න.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Secure Gateway</span>
          </div>
        </header>

        {/* Invoices List Table */}
        <div className="bg-[#060913] border border-white/10 rounded-3xl p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-4 px-4">Invoice ID / Title</th>
                <th className="pb-4 px-4">Date</th>
                <th className="pb-4 px-4">Amount</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {invoices.map((inv, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition">
                  <td className="py-4 px-4 font-medium text-white">
                    <div>{inv.title || "Logistics & Shipping Invoice"}</div>
                    <div className="text-xs font-mono text-slate-500">{inv.id || `INV-${idx + 100}`}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-400">{inv.created_at ? inv.created_at.split('T')[0] : "2026-11-14"}</td>
                  <td className="py-4 px-4 font-bold text-emerald-400">${inv.amount || 185.00}</td>
                  <td className="py-4 px-4">
                    <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold">
                      {inv.status || "Pending"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button 
                      onClick={() => alert("Downloading PDF Commercial Invoice...")}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-medium transition"
                    >
                      📥 PDF
                    </button>
                    <button 
                      onClick={() => handleStripePayment(inv.amount || 185.00, inv.title || "Logistics & Shipping Invoice")}
                      disabled={payingId === (inv.title || "Logistics & Shipping Invoice")}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20"
                    >
                      {payingId === (inv.title || "Logistics & Shipping Invoice") ? "Redirecting..." : "💳 Pay with Stripe"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}