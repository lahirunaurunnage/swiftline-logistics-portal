 'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PackageItem {
  id: number;
  shipmentType: 'Documents' | 'Packages';
  dimensionMode: 'Custom' | 'Common';
  selectedBox: string;
  weight: string;
  length: string;
  width: string;
  height: string;
}

function BookingForm() {
  const searchParams = useSearchParams();

  const [quoteIdInput, setQuoteIdInput] = useState('');
  const [shippingAs, setShippingAs] = useState<'Individual' | 'Business'>('Individual');
  const [selectedCarrier, setSelectedCarrier] = useState('DHL');

  // Shipper & Receiver Details
  const [fromName, setFromName] = useState('');
  const [fromPhone, setFromPhone] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [fromCountry, setFromCountry] = useState('Sri Lanka');
  const [fromCity, setFromCity] = useState('');
  const [fromPostal, setFromPostal] = useState('');

  const [toName, setToName] = useState('');
  const [toPhone, setToPhone] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [toCountry, setToCountry] = useState('India');
  const [toCity, setToCity] = useState('');
  const [toPostal, setToPostal] = useState('');
  const [isBusinessAddress, setIsBusinessAddress] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dynamic Packages State
  const [packages, setPackages] = useState<PackageItem[]>([
    {
      id: Date.now(),
      shipmentType: 'Packages',
      dimensionMode: 'Common',
      selectedBox: 'Medium',
      weight: '',
      length: '33.7',
      width: '32.2',
      height: '18'
    }
  ]);

  useEffect(() => {
    const qId = searchParams.get('quoteId');
    const qWeight = searchParams.get('weight');
    const qDest = searchParams.get('destination');
    
    if (qId) setQuoteIdInput(qId);
    if (qDest) setToCountry(qDest.split(' ')[0]);
    if (qWeight && packages.length > 0) {
      const updated = [...packages];
      updated[0].weight = qWeight;
      setPackages(updated);
    }
  }, [searchParams]);

  const handleAddPackage = () => {
    setPackages([
      ...packages,
      {
        id: Date.now() + Math.random(),
        shipmentType: 'Packages',
        dimensionMode: 'Common',
        selectedBox: 'Medium',
        weight: '',
        length: '33.7',
        width: '32.2',
        height: '18'
      }
    ]);
  };

  const handleRemovePackage = (index: number) => {
    if (packages.length === 1) {
      alert('You must keep at least one package.');
      return;
    }
    const updated = packages.filter((_, i) => i !== index);
    setPackages(updated);
  };

  const handlePackageChange = (index: number, field: keyof PackageItem, value: any) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'selectedBox') {
      const name = value;
      if (updated[index].shipmentType === 'Packages') {
        if (name === 'Small') { updated[index].length = '33.7'; updated[index].width = '18.2'; updated[index].height = '10'; }
        else if (name === 'Medium') { updated[index].length = '33.7'; updated[index].width = '32.2'; updated[index].height = '18'; }
        else if (name === 'Large') { updated[index].length = '33.7'; updated[index].width = '32.2'; updated[index].height = '34.5'; }
        else if (name === 'Extra-Large') { updated[index].length = '41.7'; updated[index].width = '35.9'; updated[index].height = '36.9'; }
      } else {
        if (name === 'Small Envelope') { updated[index].length = '24'; updated[index].width = '16'; updated[index].height = '1'; }
        else if (name === 'Card Envelope') { updated[index].length = '12'; updated[index].width = '16.5'; updated[index].height = '1'; }
        else if (name === 'A4 Envelope') { updated[index].length = '32'; updated[index].width = '24'; updated[index].height = '1'; }
        else if (name === 'Document Pack') { updated[index].length = '38'; updated[index].width = '28'; updated[index].height = '2'; }
      }
    }

    setPackages(updated);
  };

  const totalWeight = packages.reduce((sum, pkg) => sum + (parseFloat(pkg.weight) || 0), 0);

  const calculateCarrierCost = () => {
    const baseRate = totalWeight > 0 ? totalWeight * 10.0 : 12.5;
    let markupPercentage = 0.15;
    if (selectedCarrier === 'FEDEX') markupPercentage = 0.18;
    if (selectedCarrier === 'UPS') markupPercentage = 0.20;
    if (selectedCarrier === 'SWIFT') markupPercentage = 0.10;
    return (baseRate * (1 + markupPercentage)).toFixed(2);
  };

  const totalCost = calculateCarrierCost();

  const handleStripeCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API integration to backend / dispatch order to courier service (DHL / FedEx / UPS)
      const response = await fetch('/api/create-shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: quoteIdInput,
          shippingAs,
          selectedCarrier,
          fromName,
          fromPhone,
          fromAddress,
          fromCountry,
          fromCity,
          fromPostal,
          toName,
          toPhone,
          toAddress,
          toCountry,
          toCity,
          toPostal,
          packages,
          totalWeight,
          totalCost
        })
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error: ' + (data.error || 'Failed to initialize courier booking.'));
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleStripeCheckout} className="space-y-10">
      
      {/* Quote ID Lookup Bar */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">🔑 Have an existing Quote ID?</h3>
          <p className="text-xs text-slate-400">Enter your Quote ID to instantly load your saved tariff and route.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="e.g. SQ-4892"
            value={quoteIdInput}
            onChange={(e) => setQuoteIdInput(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-red-500 w-full sm:w-48 uppercase"
          />
          <button 
            type="button"
            onClick={() => alert(`Quote [${quoteIdInput}] loaded successfully!`)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap shadow-[0_0_15px_rgba(220,38,38,0.4)]"
          >
            Load Quote
          </button>
        </div>
      </div>

      {/* Select Logistics Carrier Partner */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-6">
        <h3 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">🌐 Select Logistics Carrier Partner</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { name: 'DHL Express', code: 'DHL', markup: '15% Margin', time: '2-4 Days' },
            { name: 'FedEx Priority', code: 'FEDEX', markup: '18% Margin', time: '2-5 Days' },
            { name: 'UPS Worldwide', code: 'UPS', markup: '20% Margin', time: '3-5 Days' },
            { name: 'Swiftline Air', code: 'SWIFT', markup: '10% Margin', time: '4-6 Days' },
          ].map((partner) => (
            <div 
              key={partner.code}
              onClick={() => setSelectedCarrier(partner.code)}
              className={`p-5 rounded-2xl border cursor-pointer transition ${selectedCarrier === partner.code ? 'bg-red-600/20 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/20'}`}
            >
              <div className="font-bold text-white text-sm">{partner.name}</div>
              <div className="text-[11px] text-red-400 mt-1 font-mono">{partner.time}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Corporate Rate + {partner.markup}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 1. Shipper & Receiver Details */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-8 lg:p-10 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-8">
        
        <div className="space-y-3">
          <label className="block text-xs font-mono text-slate-400 uppercase">I'm shipping as</label>
          <div className="inline-flex p-1.5 bg-black/50 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setShippingAs('Individual')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition ${shippingAs === 'Individual' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-slate-400 hover:text-white'}`}
            >
              Individual
            </button>
            <button
              type="button"
              onClick={() => setShippingAs('Business')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition ${shippingAs === 'Business' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-slate-400 hover:text-white'}`}
            >
              Business
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-white/10">
          
          <div className="space-y-4 bg-black/40 p-6 rounded-2xl border border-white/10">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">From (Pickup / Shipper Details)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Contact Name *</label>
                <input type="text" required placeholder="Full Name" value={fromName} onChange={(e) => setFromName(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Phone Number *</label>
                <input type="text" required placeholder="+94..." value={fromPhone} onChange={(e) => setFromPhone(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Street Address *</label>
              <input type="text" required placeholder="House No, Street Name" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Country or Territory *</label>
              <select value={fromCountry} onChange={(e) => setFromCountry(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500">
                <option>Sri Lanka</option>
                <option>China</option>
                <option>United Arab Emirates</option>
                <option>Singapore</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">City *</label>
                <input type="text" required placeholder="Matara" value={fromCity} onChange={(e) => setFromCity(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Postal Code *</label>
                <input type="text" required placeholder="81000" value={fromPostal} onChange={(e) => setFromPostal(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500" />
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-black/40 p-6 rounded-2xl border border-white/10">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">To (Receiver Details)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Receiver Name *</label>
                <input type="text" required placeholder="Recipient Name" value={toName} onChange={(e) => setToName(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Phone Number *</label>
                <input type="text" required placeholder="+91..." value={toPhone} onChange={(e) => setToPhone(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Street Address *</label>
              <input type="text" required placeholder="Delivery Address" value={toAddress} onChange={(e) => setToAddress(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Country or Territory *</label>
              <select value={toCountry} onChange={(e) => setToCountry(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500">
                <option>India</option>
                <option>Sri Lanka</option>
                <option>United Arab Emirates</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Singapore</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">City *</label>
                <input type="text" required placeholder="Kolkata" value={toCity} onChange={(e) => setToCity(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Postal Code *</label>
                <input type="text" required placeholder="700000" value={toPostal} onChange={(e) => setToPostal(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="bizAddr" checked={isBusinessAddress} onChange={(e) => setIsBusinessAddress(e.target.checked)} className="rounded bg-slate-900 border-white/10 text-red-600 focus:ring-0" />
              <label htmlFor="bizAddr" className="text-xs text-slate-400 cursor-pointer">I'm shipping to a business address</label>
            </div>
          </div>

        </div>

      </div>

      {/* 2. Dynamic Packages List */}
      {packages.map((pkg, index) => (
        <div key={`pkg-${index}`} className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-6 relative">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
            <h3 className="text-base font-bold text-white">
              Package #{index + 1} <span className="text-xs font-normal text-slate-400 ml-2">Enter package details</span>
            </h3>

            <div className="flex items-center gap-4">
              <div className="inline-flex p-1 bg-black/50 rounded-xl border border-white/10">
                <button type="button" onClick={() => handlePackageChange(index, 'shipmentType', 'Documents')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${pkg.shipmentType === 'Documents' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>Documents</button>
                <button type="button" onClick={() => handlePackageChange(index, 'shipmentType', 'Packages')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${pkg.shipmentType === 'Packages' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>Packages</button>
              </div>

              <div className="inline-flex p-1 bg-black/50 rounded-xl border border-white/10">
                <button type="button" onClick={() => handlePackageChange(index, 'dimensionMode', 'Custom')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${pkg.dimensionMode === 'Custom' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>Custom</button>
                <button type="button" onClick={() => handlePackageChange(index, 'dimensionMode', 'Common')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${pkg.dimensionMode === 'Common' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>Common Sizes</button>
              </div>

              {packages.length > 1 && (
                <button type="button" onClick={() => handleRemovePackage(index)} className="text-xs font-bold text-red-400 hover:text-red-300 transition cursor-pointer">Remove</button>
              )}
            </div>
          </div>

          {pkg.dimensionMode === 'Common' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {pkg.shipmentType === 'Packages' ? (
                (['Small', 'Medium', 'Large', 'Extra-Large'] as const).map((size) => (
                  <div key={size} onClick={() => handlePackageChange(index, 'selectedBox', size)} className={`p-4 rounded-2xl border cursor-pointer transition text-center ${pkg.selectedBox === size ? 'bg-red-600/20 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20'}`}>
                    <div className="font-bold text-sm">{size} Box</div>
                  </div>
                ))
              ) : (
                (['Small Envelope', 'Card Envelope', 'A4 Envelope', 'Document Pack'] as const).map((env) => (
                  <div key={env} onClick={() => handlePackageChange(index, 'selectedBox', env)} className={`p-4 rounded-2xl border cursor-pointer transition text-center ${pkg.selectedBox === env ? 'bg-red-600/20 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20'}`}>
                    <div className="font-bold text-sm">{env}</div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Weight * (kg)</label>
              <input type="number" required placeholder="0.00" value={pkg.weight} onChange={(e) => handlePackageChange(index, 'weight', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 font-mono" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Length * (cm)</label>
              <input type="number" required value={pkg.length} onChange={(e) => handlePackageChange(index, 'length', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 font-mono" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Width * (cm)</label>
              <input type="number" required value={pkg.width} onChange={(e) => handlePackageChange(index, 'width', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 font-mono" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Height * (cm)</label>
              <input type="number" required value={pkg.height} onChange={(e) => handlePackageChange(index, 'height', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 font-mono" />
            </div>
          </div>

        </div>
      ))}

      <div>
        <button type="button" onClick={handleAddPackage} className="px-6 py-3 bg-black/50 hover:bg-black/80 border border-white/10 text-white font-bold rounded-xl transition text-xs flex items-center gap-2 cursor-pointer shadow-lg">➕ Add Package</button>
      </div>

      {/* Final Checkout Bar */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-xs font-mono text-slate-400 uppercase">Selected Carrier: <span className="text-red-400 font-bold">{selectedCarrier}</span></div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">${totalCost} USD <span className="text-xs text-slate-400 font-normal">({totalWeight} kg total)</span></div>
          <div className="text-xs text-slate-500 mt-0.5">Includes Corporate Tariff + Margin</div>
        </div>

        <button type="submit" disabled={loading} className="w-full sm:w-auto px-10 py-5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition shadow-[0_0_20px_rgba(220,38,38,0.5)] text-base cursor-pointer whitespace-nowrap">
          {loading ? 'Processing...' : `Pay via Stripe & Schedule Pickup (${selectedCarrier}) →`}
        </button>
      </div>

    </form>
  );
}

export default function BookShipmentPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-red-500 selection:text-white">
      
      {/* Enterprise Landing-Style Navbar */}
      <header className="border-b border-white/10 bg-[#0B1120]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">S</div>
            <span className="text-lg font-extrabold tracking-tight text-white border-l border-white/10 pl-4">
              Swiftline<span className="text-red-500">.</span> Multi-Carrier Express
            </span>
          </div>
          <Link href="/dashboard" className="text-xs font-mono text-slate-400 hover:text-white transition">← Return to Client Portal</Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        
        <div className="max-w-2xl space-y-3">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Get a Quote and Create a Shipment
          </h1>
          <p className="text-slate-400 text-base">
            Multi-carrier international shipping powered by Swiftline corporate accounts and automated API dispatch.
          </p>
        </div>

        <Suspense fallback={<div className="text-slate-400">Loading shipment parameters...</div>}>
          <BookingForm />
        </Suspense>

      </main>
    </div>
  );
}