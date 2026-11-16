 "use client";
import { useState, useEffect, Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ----------------- SHIPPING ARBITRAGE CALCULATOR COMPONENT -----------------
function ShippingArbitrageSection({ jobId, productName }: { jobId: string; productName: string }) {
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [destinationCountry, setDestinationCountry] = useState("US");
  const [loadingRates, setLoadingRates] = useState(false);
  const [shippingRates, setShippingRates] = useState<any[]>([]);

  const fetchShippingRates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg || weightKg <= 0) {
      alert("Please enter a valid package weight in KG.");
      return;
    }

    setLoadingRates(true);
    try {
      const response = await fetch('/api/shipping-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightKg: Number(weightKg),
          destinationCountry: destinationCountry,
          toAddress: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zip: "10001",
            country: destinationCountry
          }
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShippingRates(data.rates);
      } else {
        alert("Error fetching rates: " + data.error);
      }
    } catch (err: any) {
      console.error("Shipping quote error:", err);
      alert("Failed to fetch shipping options.");
    } finally {
      setLoadingRates(false);
    }
  };

  const handleApproveAndShip = async (rate: any) => {
    alert(`Approved Job: ${jobId}\nSelected Courier: ${rate.carrier} (${rate.serviceName})\nTotal Price: $${rate.customerPrice}\nRedirecting to secure payment...`);
  };

  return (
    <div className="bg-gradient-to-br from-blue-950/40 to-[#0B1120] border border-blue-500/30 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl mt-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="bg-emerald-500/20 text-emerald-400 text-xs font-extrabold uppercase px-3 py-1 rounded-full border border-emerald-500/30">
            QC Approved ✓
          </span>
          <h3 className="text-xl font-extrabold text-white mt-2">Approve & Ship Your Cargo</h3>
          <p className="text-slate-400 text-sm">Enter package details to get discounted global courier rates via Swiftline Arbitrage.</p>
        </div>
      </div>

      <form onSubmit={fetchShippingRates} className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/40 p-5 rounded-2xl border border-white/10">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Package Weight (KG)</label>
          <input 
            type="number" 
            step="0.1" 
            required
            value={weightKg} 
            onChange={(e) => setWeightKg(e.target.value === "" ? "" : parseFloat(e.target.value))} 
            placeholder="e.g. 3.5" 
            className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Destination Country</label>
          <select 
            value={destinationCountry} 
            onChange={(e) => setDestinationCountry(e.target.value)} 
            className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="US">United States (US)</option>
            <option value="GB">United Kingdom (UK)</option>
            <option value="AU">Australia (AU)</option>
            <option value="CA">Canada (CA)</option>
            <option value="LK">Sri Lanka (LK)</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <button 
            type="submit" 
            disabled={loadingRates}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition shadow-[0_0_20px_rgba(37,99,235,0.4)] text-sm flex items-center justify-center gap-2"
          >
            {loadingRates ? "Fetching Live Dealer Rates..." : "⚡ Calculate Discounted Shipping Rates"}
          </button>
        </div>
      </form>

      {shippingRates.length > 0 && (
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Courier Options (Dealer Rates Applied)</h4>
          <div className="space-y-3">
            {shippingRates.map((rate) => (
              <div key={rate.serviceId} className="bg-black/60 border border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-blue-500/50 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-base">{rate.carrier}</span>
                    <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-md font-bold">{rate.serviceName}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Estimated Delivery: <span className="text-emerald-400 font-semibold">{rate.estimatedDays} Days</span></p>
                </div>
                
                <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-emerald-400">${rate.customerPrice}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Inclusive of dealer margin</p>
                  </div>
                  <button 
                    onClick={() => handleApproveAndShip(rate)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  >
                    Approve & Pay 🚀
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------- MAIN DASHBOARD CONTENT -----------------
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [trackingNo, setTrackingNo] = useState("");
  const [qcOrders, setQcOrders] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    fetchRealData();
  }, [router]);

  const fetchRealData = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      router.push("/login");
      return;
    }
    setUser(user);

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (profileData) setProfile(profileData);

    const { data: jobs } = await supabase
      .from("qc_jobs")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });
      
    if (jobs) setQcOrders(jobs);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const copyAddress = () => {
    if (!profile) return;
    const addressText = `Name: ${profile.swift_code}\nAddress: No. 123, Guangzhou Logistics Park, Baiyun District, Guangzhou, China.`;
    navigator.clipboard.writeText(addressText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getProgressStep = (status: string) => {
    if (status === "Report Ready") return 3;
    if (status === "In Progress" || status === "Awaiting AI Report" || status === "Awaiting Inspector") return 2;
    return 1;
  };

  if (!user || !profile) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] text-white">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B1120]/80 border-b border-white/10 px-6 py-4 flex justify-between items-center">
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
          <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-white transition">Logout</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* PAYMENT SUCCESS BANNER */}
        {isSuccess && (
          <div className="bg-gradient-to-r from-emerald-900/40 via-emerald-600/20 to-[#0B1120] border border-emerald-500/40 text-emerald-300 p-8 rounded-3xl mb-10 shadow-[0_0_50px_rgba(16,185,129,0.2)] relative overflow-hidden animate-in fade-in slide-in-from-top-6 duration-700">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center text-emerald-400 text-3xl shadow-inner shrink-0">
                  🎉
                </div>
                <div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase px-3 py-1 rounded-full tracking-wider mb-2 inline-block border border-emerald-500/30">
                    Payment Verified Successfully
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Your QC Inspection is Booked!
                  </h2>
                  <p className="text-slate-300 text-sm mt-1 max-w-xl">
                    We have received your $99 payment securely via Stripe. Our ground inspectors in mainland China have been notified and will be deployed shortly.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => router.replace('/dashboard')} 
                  className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2"
                >
                  <span>✨</span> Got It, View Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Box */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#060913] border border-white/10 p-6 sm:p-8 rounded-3xl shadow-xl mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back, Client! 👋</h1>
            <p className="text-slate-400 text-sm">Manage your inspections, warehouse address, and shipments seamlessly.</p>
          </div>
          <Link href="/dashboard/book-qc" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2">
            <span>🔎</span> Book New QC ($99)
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* QC Orders Table */}
            <div className="bg-[#060913] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Your QC Inspections</h2>
                <button onClick={fetchRealData} className="text-sm text-blue-400 hover:text-blue-300">🔄 Refresh</button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                      <th className="pb-4 font-bold">Order ID</th>
                      <th className="pb-4 font-bold">Product</th>
                      <th className="pb-4 font-bold">Date</th>
                      <th className="pb-4 font-bold">Status</th>
                      <th className="pb-4 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {qcOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500">No QC inspections booked yet.</td>
                      </tr>
                    ) : (
                      qcOrders.map((order) => (
                        <tr key={order.job_id} className="text-sm hover:bg-white/[0.02] transition cursor-pointer" onClick={() => setSelectedJob(order)}>
                          <td className="py-4 font-mono text-white">{order.job_id}</td>
                          <td className="py-4 text-slate-200 font-medium">{order.product_name}</td>
                          <td className="py-4 text-slate-400">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              order.status === "Report Ready" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Warehouse Address */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Your China Warehouse Address</h2>
                  <p className="text-slate-400 text-sm mt-1">Send your Supplier/Factory goods here.</p>
                </div>
                <button onClick={copyAddress} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition">
                  {copied ? "✓ Copied" : "📋 Copy Address"}
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <span className="text-slate-400 text-sm">Receiver Name (SWIFT Code):</span>
                  <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg mt-2 sm:mt-0">{profile.swift_code}</span>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <span className="text-slate-400 text-sm">China Address:</span>
                  <span className="font-medium text-slate-200 mt-2 sm:mt-0 text-right">No. 123, Guangzhou Logistics Park,<br/>Baiyun District, Guangzhou.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Tracker) */}
          <div className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-xl font-bold text-white mb-2">Global Package Tracker 🌍</h2>
              <form onSubmit={(e) => { e.preventDefault(); alert("Tracking API connected soon."); }} className="flex flex-col gap-3 mt-4">
                <input type="text" value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)} placeholder="Tracking number..." className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500" />
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition">Track Now</button>
              </form>
            </div>
          </div>

        </div>
      </main>

      {/* JOB DETAILS MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B1120] border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="bg-[#060913] p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">QC Order Details</h3>
                <p className="text-slate-400 font-mono text-sm mt-1">{selectedJob.job_id}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-slate-400 w-10 h-10 rounded-full flex items-center justify-center transition">
                ✕
              </button>
            </div>

            <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto">
              
              {/* Progress Tracker */}
              <div className="mb-10 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 rounded-full transition-all duration-500" 
                  style={{ width: getProgressStep(selectedJob.status) === 1 ? '15%' : getProgressStep(selectedJob.status) === 2 ? '50%' : '100%' }}
                ></div>
                
                <div className="relative flex justify-between">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold border-4 border-[#0B1120]">✓</div>
                    <span className="text-xs font-bold text-white">Booked</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-4 border-[#0B1120] ${getProgressStep(selectedJob.status) >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      {getProgressStep(selectedJob.status) >= 2 ? '✓' : '2'}
                    </div>
                    <span className={`text-xs font-bold ${getProgressStep(selectedJob.status) >= 2 ? 'text-white' : 'text-slate-500'}`}>In Progress</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-4 border-[#0B1120] ${getProgressStep(selectedJob.status) === 3 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      {getProgressStep(selectedJob.status) === 3 ? '✓' : '3'}
                    </div>
                    <span className={`text-xs font-bold ${getProgressStep(selectedJob.status) === 3 ? 'text-emerald-400' : 'text-slate-500'}`}>Report Ready</span>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Product</span>
                  <span className="text-white font-medium">{selectedJob.product_name}</span>
                </div>
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Quantity</span>
                  <span className="text-white font-medium">{selectedJob.quantity} pcs</span>
                </div>
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Supplier Contact</span>
                  <span className="text-white font-medium">{selectedJob.supplier_contact}</span>
                </div>
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</span>
                  <span className="text-white font-medium">{selectedJob.location || "China"}</span>
                </div>
                <div className="md:col-span-2 bg-black/30 p-5 rounded-2xl border border-white/5">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Special Instructions</span>
                  <p className="text-slate-300 text-sm mt-1 leading-relaxed">{selectedJob.special_notes || "No special instructions provided."}</p>
                </div>
              </div>

              {/* SHIPPING ARBITRAGE SECTION OR STATUS MESSAGE */}
              <div className="mt-8">
                {selectedJob.status === "Report Ready" ? (
                  <ShippingArbitrageSection jobId={selectedJob.job_id} productName={selectedJob.product_name} />
                ) : (
                  <button disabled className="w-full bg-slate-800 text-slate-500 font-bold py-4 rounded-xl border border-white/5 cursor-not-allowed">
                    Report Not Ready Yet (In Progress)
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdvancedClientDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1120]"></div>}>
      <DashboardContent />
    </Suspense>
  );
}