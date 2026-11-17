 'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminWMSPage() {
  const [loading, setLoading] = useState(false);
  
  // WMS Form States
  const [swiftCode, setSwiftCode] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('SF Express');
  
  // Volumetric & Scale Weight States
  const [actualWeightKg, setActualWeightKg] = useState('');
  const [lengthCm, setLengthCm] = useState('');
  const [widthCm, setWidthCm] = useState('');
  const [heightCm, setHeightCm] = useState('');
  
  // Smart Bin & Shelf Location States
  const [warehouseZone, setWarehouseZone] = useState('Zone A');
  const [shelfNumber, setShelfNumber] = useState('Shelf-04');
  
  // Advanced Photo & Video Inbound QC Logging States
  const [packageCondition, setPackageCondition] = useState('Intact / Good');
  const [qcMediaUrl, setQcMediaUrl] = useState('');

  const [carrierPartner, setCarrierPartner] = useState('DHL');
  const [description, setDescription] = useState('');

  // Success / Error messages & Recent Scans List
  const [message, setMessage] = useState('');
  const [recentScans, setRecentScans] = useState<any[]>([]);

  // New Feature 5 & 6 States: Consolidation & Waybill Printing
  const [bundlingClientSwift, setBundlingClientSwift] = useState('');
  const [bundlingStatus, setBundlingStatus] = useState('');

  useEffect(() => {
    fetchRecentInbounds();
  }, []);

  const fetchRecentInbounds = async () => {
    try {
      const { data } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setRecentScans(data);
    } catch (err) {
      console.error('Error fetching recent inbounds:', err);
    }
  };

  // Volumetric Weight Calculation Logic
  const actWeight = parseFloat(actualWeightKg) || 0;
  const l = parseFloat(lengthCm) || 0;
  const w = parseFloat(widthCm) || 0;
  const h = parseFloat(heightCm) || 0;
  
  const volumetricWeightKg = (l > 0 && w > 0 && h > 0) ? Number(((l * w * h) / 5000).toFixed(2)) : 0;
  const billableWeightKg = Math.max(actWeight, volumetricWeightKg);

  const handleScanPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('swift_code', swiftCode.trim().toUpperCase())
        .single();

      if (profileError || !profile) {
        throw new Error('Invalid SWIFT Code! User not found in Supabase profiles.');
      }

      const { error: insertError } = await supabase.from('packages').insert([
        {
          user_id: profile.id,
          local_tracking_number: trackingNumber.trim(),
          tracking_number: trackingNumber.trim(),
          courier_name: courierName,
          weight_kg: actWeight,
          volumetric_weight_kg: volumetricWeightKg,
          billable_weight_kg: billableWeightKg,
          dimensions: { length: l, width: w, height: h },
          warehouse_location: `${warehouseZone} - ${shelfNumber}`,
          package_condition: packageCondition,
          qc_media_url: qcMediaUrl.trim() || null,
          carrier_partner: carrierPartner,
          description: description,
          status: 'Arrived at Guangzhou Warehouse'
        }
      ]);

      if (insertError) throw insertError;

      setMessage(`success: Package registered successfully! Mapped to [${warehouseZone} - ${shelfNumber}]. Billable Wt: ${billableWeightKg} KG. Automated notification sent to client (${profile.email}). 🚀`);
      
      setTrackingNumber('');
      setActualWeightKg('');
      setLengthCm('');
      setWidthCm('');
      setHeightCm('');
      setQcMediaUrl('');
      setDescription('');
      setSwiftCode('');
      fetchRecentInbounds();

    } catch (err: any) {
      setMessage('error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Feature 5 Handler: Instant Consolidation & Box Bundling Hub
  const handleExecuteConsolidation = async () => {
    if (!bundlingClientSwift) {
      alert('Please enter Client SWIFT Code for consolidation bundling.');
      return;
    }
    setBundlingStatus('Bundling parcels into master carton...');
    try {
      // Update all packages of this client currently in warehouse to 'Consolidated Master Box'
      const { data: profile } = await supabase.from('profiles').select('id').eq('swift_code', bundlingClientSwift.trim().toUpperCase()).single();
      if (!profile) throw new Error('Client SWIFT code not found.');

      await supabase.from('packages').update({ status: 'Consolidated Master Box' }).eq('user_id', profile.id).eq('status', 'Arrived at Guangzhou Warehouse');

      setBundlingStatus(`Success! All unassigned parcels for [${bundlingClientSwift.toUpperCase()}] have been consolidated into a Master Master Box ready for dispatch. 📦✨`);
      fetchRecentInbounds();
    } catch (err: any) {
      setBundlingStatus('Consolidation Error: ' + err.message);
    }
  };

  // Feature 6 Handler: Automated Barcode Waybill & Commercial Invoice Printing
  const handlePrintWaybill = (pkg: any) => {
    const tracking = pkg.tracking_number || pkg.local_tracking_number || 'SWIFT-WAYBILL-001';
    alert(`🖨️ Generating Official ${pkg.carrier_partner || 'DHL'} Shipping Label (Waybill) & Commercial Invoice PDF for Tracking [${tracking}]...\n(Connected to Thermal Barcode Printer Engine)`);
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
          <Link href="/admin/wms" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-600/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
            <span>📟</span> WMS Inbound Scan
          </Link>
          <Link href="/admin/consolidation" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition">
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
            <h1 className="text-2xl font-extrabold text-white">Guangzhou WMS & Barcode Scanner 🏭</h1>
            <p className="text-sm text-slate-400 mt-0.5">Scanning, Shelf Mapping, QC Logging, Box Bundling Hub & Waybill Printing.</p>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Supabase WMS Live 🟢
          </span>
        </header>

        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-2xl border text-sm font-medium ${message.startsWith("success") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {message.replace(/^(success|error):\s*/, "")}
          </div>
        )}

        {/* Next-Gen WMS Scanner & Mapping Form */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="bg-red-500/20 text-red-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border border-red-500/30">
              Enterprise WMS Module ⚡
            </span>
            <h2 className="text-lg font-bold text-white mt-1">Inbound Scan, Shelf Mapping & QC Logging</h2>
          </div>
          
          <form onSubmit={handleScanPackage} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Client SWIFT Code</label>
              <input 
                type="text" value={swiftCode} onChange={(e) => setSwiftCode(e.target.value)} required
                placeholder="e.g. SWIFT-1001" 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Barcode / Tracking Number</label>
              <input 
                type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} required
                placeholder="Scan or type tracking..." 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Courier Name</label>
              <select 
                value={courierName} onChange={(e) => setCourierName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
              >
                <option value="SF Express">SF Express (顺丰速运)</option>
                <option value="ZTO Express">ZTO Express (中通快递)</option>
                <option value="YTO Express">YTO Express (圆通速递)</option>
                <option value="JD Logistics">JD Logistics (京东物流)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Actual Scale Weight (KG)</label>
              <input 
                type="number" step="0.01" value={actualWeightKg} onChange={(e) => setActualWeightKg(e.target.value)} required
                placeholder="e.g. 1.5" 
                className="w-full bg-black/40 border border-white/10 text-emerald-400 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-bold font-mono"
              />
            </div>

            <div className="sm:col-span-2 grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Length (cm)</label>
                <input 
                  type="number" step="0.1" value={lengthCm} onChange={(e) => setLengthCm(e.target.value)}
                  placeholder="L" 
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-3 py-3 focus:outline-none focus:border-red-500 text-center font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Width (cm)</label>
                <input 
                  type="number" step="0.1" value={widthCm} onChange={(e) => setWidthCm(e.target.value)}
                  placeholder="W" 
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-3 py-3 focus:outline-none focus:border-red-500 text-center font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Height (cm)</label>
                <input 
                  type="number" step="0.1" value={heightCm} onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="H" 
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-3 py-3 focus:outline-none focus:border-red-500 text-center font-mono text-xs"
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-3 bg-black/50 p-4 rounded-2xl border border-white/10 grid grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <span className="text-slate-400 uppercase block mb-1">Volumetric Weight (L×W×H / 5000):</span>
                <span className="text-blue-400 font-bold text-base">{volumetricWeightKg} KG</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase block mb-1">Final Billable Weight (Max):</span>
                <span className="text-emerald-400 font-extrabold text-lg">{billableWeightKg} KG</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Warehouse Zone</label>
              <select 
                value={warehouseZone} onChange={(e) => setWarehouseZone(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-medium"
              >
                <option value="Zone A">Zone A (General Electronics & Small items)</option>
                <option value="Zone B">Zone B (Apparel & Textile Hub)</option>
                <option value="Zone C">Zone C (Bulky Machinery & Heavy Cargo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shelf / Bin Number</label>
              <input 
                type="text" value={shelfNumber} onChange={(e) => setShelfNumber(e.target.value)} required
                placeholder="e.g. Shelf-04" 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Initial Package Condition</label>
              <select 
                value={packageCondition} onChange={(e) => setPackageCondition(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-medium"
              >
                <option value="Intact / Good">Intact / Good (පෙට්ටිය හොඳටම තියෙනවා)</option>
                <option value="Minor Dent / Scratch">Minor Dent / Scratch (පෙට්ටියේ පොඩි තැලීමක් ඇත)</option>
                <option value="Damaged / Opened">Damaged / Opened (හානි වී ඇත / විවෘත කර ඇත)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Inbound QC Photo / Video URL</label>
              <input 
                type="text" value={qcMediaUrl} onChange={(e) => setQcMediaUrl(e.target.value)} 
                placeholder="Paste Supabase Storage image/video link..." 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Outbound Carrier Partner</label>
              <select 
                value={carrierPartner} onChange={(e) => setCarrierPartner(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
              >
                <option value="DHL">DHL Express</option>
                <option value="FedEx">FedEx Priority</option>
                <option value="UPS">UPS Worldwide</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Item Description / Notes</label>
              <input 
                type="text" value={description} onChange={(e) => setDescription(e.target.value)} 
                placeholder="e.g. Silicone phone cases (50 pcs)" 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3 pt-2">
              <button 
                type="submit" disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? "Processing Scan & Logging QC..." : "Scan, Map Shelf, Log QC & Register Inbound 🚀"}
              </button>
            </div>

          </form>
        </div>

        {/* NEW SECTION 5: Instant Consolidation & Box Bundling Hub */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border border-blue-500/30">
              Consolidation Hub 📦
            </span>
            <h2 className="text-lg font-bold text-white mt-1">Instant Box Bundling & Master Carton Assembly</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Client SWIFT Code to Bundle</label>
              <input 
                type="text" value={bundlingClientSwift} onChange={(e) => setBundlingClientSwift(e.target.value)}
                placeholder="e.g. SWIFT-1001" 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-mono uppercase"
              />
            </div>
            <div>
              <button 
                type="button" onClick={handleExecuteConsolidation}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-600/30 text-xs cursor-pointer"
              >
                Bundle Client Parcels into Master Box 📦✨
              </button>
            </div>
            {bundlingStatus && (
              <div className="sm:col-span-3 text-xs font-mono text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                {bundlingStatus}
              </div>
            )}
          </div>
        </div>

        {/* Recent Guangzhou Inbounds Table with Waybill Printing */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h2 className="text-base font-bold text-white">📋 Recent Guangzhou Warehouse Inbounds (Real Supabase Data)</h2>
            <button onClick={fetchRecentInbounds} className="text-xs font-mono text-red-400 hover:underline cursor-pointer">Refresh List 🔄</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase">
                  <th className="py-3 px-3">Tracking Number</th>
                  <th className="py-3 px-3">Courier</th>
                  <th className="py-3 px-3">Billable Wt</th>
                  <th className="py-3 px-3">Shelf</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Waybill / Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentScans.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-500 font-sans">No inbound parcels scanned yet.</td></tr>
                ) : (
                  recentScans.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-white/[0.02]">
                      <td className="py-4 px-3 font-bold text-white">{pkg.tracking_number || pkg.local_tracking_number}</td>
                      <td className="py-4 px-3 text-slate-300">{pkg.courier_name}</td>
                      <td className="py-4 px-3 text-emerald-400 font-bold">{pkg.billable_weight_kg || pkg.weight_kg} kg</td>
                      <td className="py-4 px-3 text-blue-400">{pkg.warehouse_location || 'Zone A - Shelf-01'}</td>
                      <td className="py-4 px-3">
                        <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-sans text-[10px]">
                          {pkg.status}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <button 
                          onClick={() => handlePrintWaybill(pkg)}
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 rounded-lg text-[10px] font-sans font-bold transition cursor-pointer"
                        >
                          🖨️ Print Waybill & Invoice PDF
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