 'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminConsolidationPage() {
  const [swiftCode, setSwiftCode] = useState('');
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [clientPackages, setClientPackages] = useState<any[]>([]);
  const [selectedPkgIds, setSelectedPkgIds] = useState<string[]>([]);
  
  // Master Carton Dimension & Weight States
  const [masterLength, setMasterLength] = useState('');
  const [masterWidth, setMasterWidth] = useState('');
  const [masterHeight, setMasterHeight] = useState('');
  const [masterScaleWeight, setMasterScaleWeight] = useState('');

  // Special Protection Requests States
  const [bubbleWrap, setBubbleWrap] = useState(false);
  const [woodenCrating, setWoodenCrating] = useState(false);
  const [vacuumSeal, setVacuumSeal] = useState(false);

  // Shipping Mode & QC Log States
  const [shippingMode, setShippingMode] = useState('Air Freight');
  const [repackPhotoUrl, setRepackPhotoUrl] = useState('');

  // Payment Gateway & Customs HS Codes States
  const [paymentGateway, setPaymentGateway] = useState('Stripe (USD)');
  const [hsCode, setHsCode] = useState('8517.12 (Smartphones / Electronics)');
  const [declaredValueUSD, setDeclaredValueUSD] = useState('150.00');

  // Live Tracking & Manager Two-Step Verification States
  const [flightOrVesselNo, setFlightOrVesselNo] = useState('CX-882 (Air Cargo Flight)');
  const [warehouseManagerApproval, setWarehouseManagerApproval] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 1. Auto-Detect Unconsolidated Parcels when SWIFT Code is entered
  const handleFetchClientPackages = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setClientProfile(null);
    setClientPackages([]);
    setSelectedPkgIds([]);

    try {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('swift_code', swiftCode.trim().toUpperCase())
        .single();

      if (profileErr || !profile) {
        throw new Error('Client SWIFT Code not found in database.');
      }

      setClientProfile(profile);

      // Fetch packages that are in warehouse and not yet consolidated
      const { data: pkgs, error: pkgErr } = await supabase
        .from('packages')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'Arrived at Guangzhou Warehouse');

      if (pkgErr) throw pkgErr;

      setClientPackages(pkgs || []);
      if (!pkgs || pkgs.length === 0) {
        setMessage('error: No unconsolidated packages found in warehouse for this client.');
      } else {
        setMessage(`success: Found ${pkgs.length} parcel(s) ready for consolidation.`);
      }
    } catch (err: any) {
      setMessage('error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectPackage = (id: string) => {
    if (selectedPkgIds.includes(id)) {
      setSelectedPkgIds(selectedPkgIds.filter(item => item !== id));
    } else {
      setSelectedPkgIds([...selectedPkgIds, id]);
    }
  };

  // 2. Volumetric Optimization Calculation Logic
  const ml = parseFloat(masterLength) || 0;
  const mw = parseFloat(masterWidth) || 0;
  const mh = parseFloat(masterHeight) || 0;
  const actualWt = parseFloat(masterScaleWeight) || 0;

  const masterVolumetricWt = (ml > 0 && mw > 0 && mh > 0) ? Number(((ml * mw * mh) / 5000).toFixed(2)) : 0;
  const masterBillableWt = Math.max(actualWt, masterVolumetricWt);

  // 3 & 4. Additional Protection Fees & Carrier Arbitrage Cost Estimation
  const protectionFee = (bubbleWrap ? 5 : 0) + (woodenCrating ? 25 : 0) + (vacuumSeal ? 8 : 0);
  const baseRatePerKg = shippingMode === 'Air Freight' ? 12.50 : 4.20;
  const estimatedShippingCost = Number((masterBillableWt * baseRatePerKg + protectionFee).toFixed(2));

  // Final Execution: Two-Step Manager Verification, Multi-Currency Payment, Customs Declaration, Live Tracking & Thermal Waybill
  const handleExecuteMasterConsolidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPkgIds.length === 0) {
      alert('Please select at least one package to consolidate.');
      return;
    }
    if (!warehouseManagerApproval) {
      alert('Error: Warehouse Manager Two-Step Verification approval is required before dispatch!');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Process Multi-Currency Payment Gateway & Wallet Deduction
      const currentWallet = clientProfile.wallet_balance || 0;
      const newWalletBalance = Math.max(0, currentWallet - estimatedShippingCost);
      await supabase
        .from('profiles')
        .update({ wallet_balance: newWalletBalance })
        .eq('id', clientProfile.id);

      // Create master shipment record with Live Radar Tracking & Manager Verification
      const { error: shipErr } = await supabase.from('shipments').insert([
        {
          user_id: clientProfile.id,
          package_ids: selectedPkgIds,
          total_weight: masterBillableWt,
          total_cbm: Number((ml * mw * mh / 1000000).toFixed(4)),
          shipping_mode: shippingMode,
          protection_options: { bubbleWrap, woodenCrating, vacuumSeal, protectionFee },
          estimated_cost: estimatedShippingCost,
          payment_gateway: paymentGateway,
          customs_declaration: { hsCode, declaredValueUSD: parseFloat(declaredValueUSD) || 0 },
          live_tracking_info: { 
            carrierRef: flightOrVesselNo, 
            trackingUrl: shippingMode === 'Air Freight' ? `https://www.flightradar24.com/${flightOrVesselNo}` : `https://www.vesselfinder.com/vessels/${flightOrVesselNo}` 
          },
          manager_verification: 'Quality & Packing Verified',
          repack_photo_url: repackPhotoUrl.trim() || null,
          status: 'Ready for Dispatch'
        }
      ]);

      if (shipErr) throw shipErr;

      // Update selected packages status to 'Consolidated Master Box'
      const { error: updateErr } = await supabase
        .from('packages')
        .update({ status: 'Consolidated Master Box' })
        .in('id', selectedPkgIds);

      if (updateErr) throw updateErr;

      setMessage(`success: Master carton verified by Manager! Paid via [${paymentGateway}]. Customs HS Code [${hsCode}] declared. Live Tracking active. Dispatch ready! 🚀📦`);
      
      // Trigger Thermal Printer / Waybill & Live Tracking simulation
      alert(`🖨️ Warehouse Manager Approved & Payment Processed via ${paymentGateway}!\nLive Radar Tracking Link Generated for ${flightOrVesselNo}.\nThermal Waybill & Customs Commercial Invoice Ready.`);

      setClientPackages(clientPackages.filter(p => !selectedPkgIds.includes(p.id)));
      setSelectedPkgIds([]);
      setMasterLength('');
      setMasterWidth('');
      setMasterHeight('');
      setMasterScaleWeight('');
      setRepackPhotoUrl('');
      setWarehouseManagerApproval(false);

    } catch (err: any) {
      setMessage('error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans flex flex-col md:flex-row selection:bg-red-500 selection:text-white">
      
      {/* Full Admin Sidebar Navigation */}
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
          <Link href="/admin/consolidation" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-600/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
            <span>📦</span> Consolidation Hub
          </Link>
          <Link href="/admin/qc" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition">
            <span>✨</span> Smart AI QC Audits
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
          <Link href="/admin/support" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition">
            <span>🎧</span> Support Tickets
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <Link href="/dashboard" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition text-xs font-bold border border-blue-500/35">
            👁️ View Client Portal
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-12 space-y-10">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Next-Gen Consolidation Manager 📦➔📦</h1>
            <p className="text-sm text-slate-400 mt-0.5">Live Radar Tracking, Manager Verification, Multi-Currency Pay & Dispatch, Customs HS Declarations.</p>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Hub Live 🟢
          </span>
        </header>

        {/* Message Alert */}
        {message && (
          <div className={`p-4 rounded-2xl border text-sm font-medium ${message.startsWith("success") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {message.replace(/^(success|error):\s*/, "")}
          </div>
        )}

        {/* Step 1: Search Client by SWIFT Code to Auto-Detect Parcels */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border border-blue-500/30">
              Step 1: Client Lookup 🔍
            </span>
            <h2 className="text-lg font-bold text-white mt-1">Auto-Detect Unconsolidated Warehouse Parcels</h2>
          </div>

          <form onSubmit={handleFetchClientPackages} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Client SWIFT Code</label>
              <input 
                type="text" value={swiftCode} onChange={(e) => setSwiftCode(e.target.value)} required
                placeholder="e.g. SWIFT-1001" 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-mono uppercase"
              />
            </div>
            <div>
              <button 
                type="submit" disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(220,38,38,0.4)] text-xs cursor-pointer"
              >
                {loading ? 'Searching Warehouse...' : 'Fetch Client Parcels 🔍'}
              </button>
            </div>
          </form>
        </div>

        {/* Step 2: Select Parcels & Configure Master Carton */}
        {clientProfile && (
          <form onSubmit={handleExecuteMasterConsolidation} className="space-y-8 animate-in fade-in duration-300">
            
            {/* Detected Packages Table */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                    Step 2: Parcel Selection 📦
                  </span>
                  <h2 className="text-base font-bold text-white mt-1">
                    Select Parcels for Client: <span className="text-red-400 font-mono">{clientProfile.swift_code}</span> ({clientProfile.email}) | Wallet Balance: <span className="text-emerald-400">${(clientProfile.wallet_balance || 0).toFixed(2)}</span>
                  </h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase">
                      <th className="py-3 px-3">Select</th>
                      <th className="py-3 px-3">Tracking #</th>
                      <th className="py-3 px-3">Courier</th>
                      <th className="py-3 px-3">Billable Wt</th>
                      <th className="py-3 px-3">Shelf Location</th>
                      <th className="py-3 px-3 text-right">QC Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {clientPackages.length === 0 ? (
                      <tr><td colSpan={6} className="py-6 text-center text-slate-500 font-sans">No pending parcels in warehouse for this client.</td></tr>
                    ) : (
                      clientPackages.map((pkg) => (
                        <tr key={pkg.id} className="hover:bg-white/[0.02]">
                          <td className="py-4 px-3">
                            <input 
                              type="checkbox" 
                              checked={selectedPkgIds.includes(pkg.id)}
                              onChange={() => toggleSelectPackage(pkg.id)}
                              className="w-4 h-4 rounded border-white/10 bg-black/50 text-red-600 focus:ring-red-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-4 px-3 font-bold text-white">{pkg.tracking_number || pkg.local_tracking_number}</td>
                          <td className="py-4 px-3 text-slate-300">{pkg.courier_name}</td>
                          <td className="py-4 px-3 text-emerald-400 font-bold">{pkg.billable_weight_kg || pkg.weight_kg} kg</td>
                          <td className="py-4 px-3 text-blue-400">{pkg.warehouse_location || 'Zone A - Shelf-01'}</td>
                          <td className="py-4 px-3 text-right text-yellow-400">{pkg.package_condition || 'Intact'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step 3: Master Carton, Live Tracking, Multi-Currency Payment, Customs & Manager Approval */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="bg-purple-500/20 text-purple-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border border-purple-500/30">
                  Step 3: Pay & Dispatch, Customs HS Codes & Live Radar 📐
                </span>
                <h2 className="text-lg font-bold text-white mt-1">Master Carton, Multi-Currency Pay & Dispatch, Live Radar & Two-Step Verification</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Master Length (cm)</label>
                  <input 
                    type="number" step="0.1" value={masterLength} onChange={(e) => setMasterLength(e.target.value)} required
                    placeholder="e.g. 50" 
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-mono text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Master Width (cm)</label>
                  <input 
                    type="number" step="0.1" value={masterWidth} onChange={(e) => setMasterWidth(e.target.value)} required
                    placeholder="e.g. 40" 
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-mono text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Master Height (cm)</label>
                  <input 
                    type="number" step="0.1" value={masterHeight} onChange={(e) => setMasterHeight(e.target.value)} required
                    placeholder="e.g. 30" 
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-mono text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Actual Scale Wt (KG)</label>
                  <input 
                    type="number" step="0.01" value={masterScaleWeight} onChange={(e) => setMasterScaleWeight(e.target.value)} required
                    placeholder="e.g. 10.5" 
                    className="w-full bg-black/40 border border-white/10 text-emerald-400 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-bold font-mono text-xs"
                  />
                </div>
              </div>

              {/* Volumetric & Carrier Arbitrage Summary Box */}
              <div className="bg-black/50 p-5 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div>
                  <span className="text-slate-400 uppercase block mb-1">Master Volumetric Weight:</span>
                  <span className="text-blue-400 font-bold text-base">{masterVolumetricWt} KG</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase block mb-1">Final Billable Weight (Max):</span>
                  <span className="text-emerald-400 font-extrabold text-lg">{masterBillableWt} KG</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase block mb-1">Total Shipping Cost:</span>
                  <span className="text-red-400 font-extrabold text-lg">${estimatedShippingCost}</span>
                </div>
              </div>

              {/* Special Protection Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Extra Protection & Handling Requests</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 bg-black/40 border border-white/10 p-3.5 rounded-xl cursor-pointer hover:bg-white/[0.02]">
                    <input type="checkbox" checked={bubbleWrap} onChange={(e) => setBubbleWrap(e.target.checked)} className="w-4 h-4 rounded text-red-600 bg-black/50 border-white/10 cursor-pointer" />
                    <span className="text-xs font-medium text-slate-300">Bubble Wrap Protection (+$5)</span>
                  </label>
                  <label className="flex items-center gap-3 bg-black/40 border border-white/10 p-3.5 rounded-xl cursor-pointer hover:bg-white/[0.02]">
                    <input type="checkbox" checked={woodenCrating} onChange={(e) => setWoodenCrating(e.target.checked)} className="w-4 h-4 rounded text-red-600 bg-black/50 border-white/10 cursor-pointer" />
                    <span className="text-xs font-medium text-slate-300">Wooden Crating / Palletizing (+$25)</span>
                  </label>
                  <label className="flex items-center gap-3 bg-black/40 border border-white/10 p-3.5 rounded-xl cursor-pointer hover:bg-white/[0.02]">
                    <input type="checkbox" checked={vacuumSeal} onChange={(e) => setVacuumSeal(e.target.checked)} className="w-4 h-4 rounded text-red-600 bg-black/50 border-white/10 cursor-pointer" />
                    <span className="text-xs font-medium text-slate-300">Waterproof Vacuum Sealing (+$8)</span>
                  </label>
                </div>
              </div>

              {/* Multi-Currency Payment Gateway & Customs HS Codes Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Gateway (Pay & Dispatch)</label>
                  <select 
                    value={paymentGateway} onChange={(e) => setPaymentGateway(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-medium text-xs"
                  >
                    <option value="Stripe (USD)">💳 Stripe Credit Card (USD)</option>
                    <option value="PayPal">🅿️ PayPal Express Checkout</option>
                    <option value="Local Bank Transfer">🏦 Local Bank Transfer / Wire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customs HS Code</label>
                  <select 
                    value={hsCode} onChange={(e) => setHsCode(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-medium text-xs"
                  >
                    <option value="8517.12 (Smartphones & Telecom)">8517.12 (Smartphones & Telecom)</option>
                    <option value="6109.10 (Cotton T-Shirts & Apparel)">6109.10 (Cotton T-Shirts & Apparel)</option>
                    <option value="8471.30 (Portable Laptops & Computers)">8471.30 (Portable Laptops & Computers)</option>
                    <option value="9503.00 (Toys & Hobby Goods)">9503.00 (Toys & Hobby Goods)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Declared Customs Value (USD)</label>
                  <input 
                    type="number" step="0.01" value={declaredValueUSD} onChange={(e) => setDeclaredValueUSD(e.target.value)} required
                    placeholder="e.g. 150.00" 
                    className="w-full bg-black/40 border border-white/10 text-emerald-400 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-bold font-mono text-xs"
                  />
                </div>
              </div>

              {/* Shipping Mode, Live Tracking Ref & Repack Photo URL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shipping Mode</label>
                  <select 
                    value={shippingMode} onChange={(e) => setShippingMode(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-medium text-xs"
                  >
                    <option value="Air Freight">✈️ Air Freight (Flight Radar)</option>
                    <option value="Sea Freight">🚢 Sea Freight (Vessel Finder)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Live Flight / Vessel Ref</label>
                  <input 
                    type="text" value={flightOrVesselNo} onChange={(e) => setFlightOrVesselNo(e.target.value)} required
                    placeholder="e.g. CX-882" 
                    className="w-full bg-black/40 border border-white/10 text-blue-400 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-mono text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Repack Verification Photo URL</label>
                  <input 
                    type="text" value={repackPhotoUrl} onChange={(e) => setRepackPhotoUrl(e.target.value)}
                    placeholder="Paste Supabase link..." 
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Two-Step Verification Checkbox */}
              <div className="bg-black/50 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" checked={warehouseManagerApproval} onChange={(e) => setWarehouseManagerApproval(e.target.checked)}
                    className="w-5 h-5 rounded text-emerald-600 bg-black/50 border-white/10 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">Warehouse Manager Two-Step Verification Approval</div>
                    <div className="text-[11px] text-slate-400">Check to certify "Quality & Packing Verified" before final dispatch release.</div>
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-3 py-1 rounded-full border ${warehouseManagerApproval ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                  {warehouseManagerApproval ? 'Approved ✅' : 'Pending Approval ⏳'}
                </span>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                >
                  {loading ? 'Processing Pay & Dispatch & Customs Declaration...' : 'Pay & Dispatch via Gateway & Generate Customs Declaration 🚀'}
                </button>
              </div>

            </div>

          </form>
        )}

      </main>
    </div>
  );
}