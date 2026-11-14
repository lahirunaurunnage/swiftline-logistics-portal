"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import jsPDF from "jspdf";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardInvoices() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      // 1. Authenticate user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // 2. Fetch User Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profileData) setProfile(profileData);

      // 3. Fetch shipped packages or invoices from Supabase
      const { data: pkgData } = await supabase
        .from("packages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (pkgData) {
        setInvoices(pkgData);
      }
      setLoading(false);
    };

    fetchInvoiceData();
  }, [router]);

  // PDF Commercial Invoice එක ස්වයංක්‍රීයව ජනනය කර ඩවුන්ලෝඩ් කිරීම
  const generatePDFInvoice = (item: any) => {
    const doc = new jsPDF();

    // Company Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text("SWIFTLINE HOLDINGS (PVT) LTD", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Guangzhou Central Warehouse & Logistics Hub", 14, 26);
    doc.text("Commercial Invoice & Customs Declaration", 14, 32);

    // Divider Line
    doc.setLineWidth(0.5);
    //doc.setLineColor(200, 200, 200);
    doc.line(14, 38, 196, 38);

    // Invoice Meta
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice ID: INV-${item.id.slice(0, 8).toUpperCase()}`, 14, 48);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(item.created_at).toLocaleDateString()}`, 14, 54);
    doc.text(`Client SWIFT Code: ${profile?.swift_code || "N/A"}`, 14, 60);

    // Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 70, 182, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Tracking Number", 18, 76);
    doc.text("Courier", 80, 76);
    doc.text("Weight (KG)", 130, 76);
    doc.text("Status", 165, 76);

    // Table Data
    doc.setFont("helvetica", "normal");
    doc.text(item.local_tracking_number || "N/A", 18, 88);
    doc.text(item.courier_name || "SF Express", 80, 88);
    doc.text(`${item.weight_kg || 0.00} KG`, 130, 88);
    doc.text(item.status || "Processed", 165, 88);

    // Total / Footer Box
    doc.setLineWidth(0.2);
    doc.line(14, 100, 196, 100);
    doc.setFont("helvetica", "bold");
    doc.text("Shipping Terms: DAP / Air & Sea Cargo", 14, 110);
    doc.text("Authorized Signature: ______________________", 14, 125);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated commercial invoice from Swiftline WMS System.", 14, 145);

    // Save PDF
    doc.save(`Commercial-Invoice-${item.local_tracking_number}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1120] text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm tracking-widest uppercase">Loading Invoices...</p>
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
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Commercial Invoices & Customs Docs</h2>
          <p className="text-slate-400 text-sm mt-1">රේගු සහ ගිණුම්කරණ කටයුතු සඳහා ස්වයංක්‍රීයව සකස් කළ PDF බිල්පත් ඩවුන්ලෝඩ් කරගන්න.</p>
        </div>

        {invoices.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-slate-400 backdrop-blur-md">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-lg font-medium">කිසිදු ඉන්වොයිසියක් හමු නොවීය.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.map((inv) => (
              <div key={inv.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
                      {inv.status || "In Warehouse"}
                    </span>
                    <span className="text-slate-400 text-xs font-mono">
                      {inv.weight_kg} KG
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 font-mono">{inv.local_tracking_number}</h3>
                  <p className="text-slate-400 text-xs mb-6">Courier: {inv.courier_name}</p>
                </div>

                <button 
                  onClick={() => generatePDFInvoice(inv)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2"
                >
                  <span>📥</span> Download Commercial Invoice (PDF)
                </button>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}