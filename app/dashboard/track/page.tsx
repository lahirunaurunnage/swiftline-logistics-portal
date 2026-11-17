 'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TrackShipmentPage() {
  const [trackingNo, setTrackingNo] = useState('');
  const [shipmentData, setShipmentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate real-time tracking fetch from Supabase/DHL API
    setTimeout(() => {
      setShipmentData({
        trackingNumber: trackingNo || 'SWIFT-998241',
        carrier: 'DHL Express',
        status: 'In Transit - Flight Departed',
        origin: 'Guangzhou Warehouse, China',
        destination: 'Colombo, Sri Lanka',
        steps: [
          { title: 'Package Scanned at Guangzhou Warehouse', date: 'Nov 15, 10:30 AM', completed: true },
          { title: 'AI Quality Control Audit Passed', date: 'Nov 15, 11:00 AM', completed: true },
          { title: 'Loaded onto International Flight', date: 'Nov 16, 02:00 AM', completed: true },
          { title: 'Customs Clearance & Courier Dispatch', date: 'Expected Nov 18', completed: false },
          { title: 'Final Doorstep Delivery', date: 'Expected Nov 19', completed: false },
        ]
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans p-6 lg:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Live Shipment Tracking</h1>
            <p className="text-slate-400 text-sm">Real-time milestones powered by Swiftline & DHL/FedEx APIs.</p>
          </div>
          <Link href="/dashboard" className="text-xs font-mono text-red-400 hover:underline">← Back to Portal</Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleTrack} className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl flex gap-4">
          <input 
            type="text" 
            placeholder="Enter Tracking # or Quote ID (e.g. SWIFT-998241)"
            value={trackingNo}
            onChange={(e) => setTrackingNo(e.target.value)}
            required
            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-red-500 uppercase"
          />
          <button 
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition cursor-pointer text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.4)]"
          >
            {loading ? 'Searching...' : 'Track Live'}
          </button>
        </form>

        {/* Results Box */}
        {shipmentData && (
          <div className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between border-b border-white/10 pb-4 gap-2">
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase">Tracking Number</div>
                <div className="text-lg font-bold font-mono text-white">{shipmentData.trackingNumber}</div>
              </div>
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase">Carrier Partner</div>
                <div className="text-lg font-bold text-red-400">{shipmentData.carrier}</div>
              </div>
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase">Current Status</div>
                <div className="text-sm font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mt-1 inline-block">{shipmentData.status}</div>
              </div>
            </div>

            {/* Timeline Milestones */}
            <div className="space-y-6 pt-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Milestone Progress</h3>
              <div className="space-y-4 border-l-2 border-white/10 pl-6 ml-2">
                {shipmentData.steps.map((step: any, idx: number) => (
                  <div key={idx} className="relative space-y-1">
                    <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 ${step.completed ? 'bg-red-600 border-red-400 shadow-[0_0_10px_rgba(220,38,38,0.6)]' : 'bg-slate-900 border-slate-700'}`}></div>
                    <div className={`text-sm font-bold ${step.completed ? 'text-white' : 'text-slate-500'}`}>{step.title}</div>
                    <div className="text-xs font-mono text-slate-400">{step.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}