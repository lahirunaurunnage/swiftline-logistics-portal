 'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function NextLevelFinalLandingPage() {
  // Instant Quote Calculator States
  const [weight, setWeight] = useState('');
  const [destination, setDestination] = useState('USA');
  const [serviceType, setServiceType] = useState('Air Express');
  const [quoteResult, setQuoteResult] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Live Tracking States
  const [trackingNo, setTrackingNo] = useState('');
  const [trackingResult, setTrackingResult] = useState<string | null>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    setCalculating(true);
    setTimeout(() => {
      const w = parseFloat(weight);
      let base = serviceType === 'Air Express' ? 15 : 8;
      let total = (w * base) + 30;
      setQuoteResult(parseFloat(total.toFixed(2)));
      setCalculating(false);
    }, 800);
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNo) return;
    setTrackingResult(`Status for ${trackingNo}: 📦 In Transit - Customs Cleared at Guangzhou Hub (On Schedule) 🟢`);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-500 selection:text-white overflow-x-hidden font-sans relative">
      
      {/* Background Professional CSS Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10"></div>

      {/* 0. Top Live Global Status Ticker */}
      <div className="bg-slate-950 text-slate-400 text-xs py-2 px-6 border-b border-slate-800 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-indigo-400 font-semibold">GLOBAL HUBS ONLINE:</span> 
            <span>Guangzhou (Active)</span> • <span>Dubai (Active)</span> • <span>Colombo (Operational)</span>
          </div>
          <div className="flex items-center gap-4">
            <span>⚡ Autonomous Engine v4.5</span>
            <span className="text-emerald-400">● Stripe Secure</span>
          </div>
        </div>
      </div>

      {/* 1. Next-Level SaaS Navbar with Logo */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Swiftline International Logistics" 
              className="h-10 sm:h-12 w-auto object-contain" 
            />
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#calculator" className="hover:text-indigo-600 transition">Instant Quote 🧮</a>
            <a href="#tracking" className="hover:text-indigo-600 transition">Live Track 🔍</a>
            <a href="#features" className="hover:text-indigo-600 transition">Platform</a>
            <a href="#inspectors" className="hover:text-indigo-600 transition">Inspectors</a>
            <a href="#shipping" className="hover:text-indigo-600 transition">Shipping</a>
            <a href="#reviews" className="hover:text-indigo-600 transition">Reviews ⭐</a>
            <a href="#faq" className="hover:text-indigo-600 transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2 transition">
              Sign In
            </Link>
            <Link href="/dashboard/book-qc" className="text-sm font-medium bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20">
              Book QC ($99)
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Blurry Background Inspector Photo Effect */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
        
        {/* Absolute Blurry Inspector Photo Background Layer */}
        <div className="absolute inset-0 z-0 opacity-15 overflow-hidden pointer-events-none">
          <img src="/inspector_branding.jpg" alt="Background Blur" className="w-full h-full object-cover filter blur-3xl scale-110" />
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider mx-auto shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Autonomous Global Sourcing & QC Operating System
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] max-w-4xl mx-auto">
            Take full control of your <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">global supply chain.</span>
          </h1>

          <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            No chasing agents or waiting for manual quotations. Book instant factory QC audits for $99, manage virtual warehouses, and route parcels end-to-end completely on your own terms.
          </p>

          {/* Quick Live Tracking Bar */}
          <div id="tracking" className="bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xl max-w-xl mx-auto">
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2">
              <input 
                type="text" 
                value={trackingNo} 
                onChange={(e) => setTrackingNo(e.target.value)} 
                placeholder="Enter Tracking ID (e.g. SWIFT-9982)..." 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-indigo-600"
              />
              <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-3 rounded-xl text-xs transition cursor-pointer shadow-md">
                Track Parcel ⚡
              </button>
            </form>
            {trackingResult && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-mono">
                {trackingResult}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/dashboard/book-qc" className="inline-flex items-center justify-center font-medium bg-indigo-600 text-white px-8 py-4 rounded-full hover:bg-indigo-700 transition shadow-xl shadow-indigo-600/25 text-base group">
              Book Instant QC ($99)
              <span className="ml-2 group-hover:translate-x-1 transition">→</span>
            </Link>
            <Link href="/dashboard" className="inline-flex items-center justify-center font-medium bg-white text-slate-800 px-8 py-4 rounded-full hover:bg-slate-50 transition text-base border border-slate-200 shadow-sm">
              Access Portal Dashboard
            </Link>
          </div>

          <div className="pt-8 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-6 text-slate-600 text-sm font-medium max-w-3xl mx-auto">
            <div><strong className="text-slate-900 block text-lg">Self-Service</strong> Instant Actions</div>
            <div><strong className="text-slate-900 block text-lg">$99.00</strong> Flat QC Rate</div>
            <div><strong className="text-slate-900 block text-lg">Stripe</strong> Secured Payments</div>
          </div>

        </div>
      </section>

      {/* 3. Interactive Instant Freight & QC Calculator */}
      <section id="calculator" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Interactive Self-Service Engine
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900">Instant Shipping & Freight Estimator</h2>
            <p className="text-slate-600 text-sm">Calculate precise shipping estimates across global trade routes instantly.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-2">Package Weight (KG)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  required 
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)} 
                  placeholder="e.g. 10.5" 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 font-mono focus:outline-none focus:border-indigo-600" 
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-2">Destination Route</label>
                <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3">
                  <option value="USA">Guangzhou ➔ United States</option>
                  <option value="EU">Guangzhou ➔ European Union</option>
                  <option value="UAE">Dubai ➔ Colombo / Global</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-2">Service Speed</label>
                <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3">
                  <option value="Air Express">Air Express (3-5 Days)</option>
                  <option value="Economy Freight">Economy Air (7-10 Days)</option>
                </select>
              </div>
              <div className="sm:col-span-3 pt-2">
                <button type="submit" disabled={calculating} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl transition cursor-pointer text-sm shadow-xl shadow-indigo-600/20">
                  {calculating ? 'Calculating Global Rates...' : 'Calculate Estimate Now 🚀'}
                </button>
              </div>
            </form>

            {quoteResult !== null && (
              <div className="mt-6 bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2">
                <p className="text-xs text-emerald-800 uppercase font-mono">Estimated Freight & Handling Quote:</p>
                <p className="text-3xl font-extrabold text-emerald-600 font-mono">${quoteResult} USD</p>
                <p className="text-[10px] text-slate-500">Includes secure handling, multi-carrier optimization, and customs pre-clearance.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Instant Shipping Quotation & Booking Section */}
      <div id="shipping">
        <section className="py-24 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Autonomous Logistics
                </span>
                <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
                  Ship your goods globally. Instantly.
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Get real-time shipping quotations, book freight services, and generate shipping labels directly from your Swiftline dashboard. No more waiting for email quotes or calling agents.
                </p>
                <div className="flex gap-4 pt-2">
                  <Link href="/dashboard/get-quote" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-medium rounded-full transition shadow-xl shadow-indigo-600/25">
                    Get Instant Shipping Quote →
                  </Link>
                </div>
              </div>
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Simple 1-Click Booking</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 shadow-sm">Guangzhou ➔ New York</div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 shadow-sm">Dubai ➔ Colombo</div>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>✅ Instant Rate Calculation (Air/Sea)</p>
                  <p>✅ Automated Label Generation</p>
                  <p>✅ Live Parcel Tracking</p>
                  <p>✅ Virtual Warehouse Integration</p>
                </div>
                <Link href="/dashboard/book-shipment" className="block w-full text-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition">
                  Book Shipping Service
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 5. Trusted Partners Strip */}
      <section className="py-12 border-y border-slate-200 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
            Empowering global importers with fully independent digital infrastructure
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition duration-300">
            <span className="text-xl font-bold tracking-tighter text-slate-800">GLOBAL SOURCING</span>
            <span className="text-xl font-bold tracking-widest text-slate-800">APEX LOGISTICS</span>
            <span className="text-xl font-bold tracking-tight text-slate-800">ZENITH HOLDINGS</span>
            <span className="text-xl font-bold tracking-widest text-slate-800">TRANS-ASIA</span>
          </div>
        </div>
      </section>

      {/* 6. Self-Service Workflow Section */}
      <div id="workflow">
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Autonomous Self-Service Engine
              </span>
              <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight">
                Take full control of your sourcing & QC in 3 simple steps.
              </h2>
              <p className="text-slate-400 text-lg">
                No agents to chase. No hidden quotes. Book, pay, and route your parcels directly from your portal dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 relative group hover:border-indigo-500 transition">
                <div className="text-5xl font-extrabold text-indigo-500/20 mb-4">01</div>
                <h3 className="text-xl font-bold text-white mb-2">Configure Service</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Select Instant QC Inspection ($99 fixed), Virtual Warehouse storage, or shipment routing directly from your dashboard.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-900 text-xs font-mono text-indigo-400">
                  → Instant CBM / Spec Calculation
                </div>
              </div>

              <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 relative group hover:border-purple-500 transition">
                <div className="text-5xl font-extrabold text-purple-500/20 mb-4">02</div>
                <h3 className="text-xl font-bold text-white mb-2">Secure Stripe Checkout</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Pay securely via Stripe in seconds. Your booking is instantly logged into the Supabase database without manual delays.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-900 text-xs font-mono text-purple-400">
                  → Instant Job ID Generation
                </div>
              </div>

              <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 relative group hover:border-orange-500 transition">
                <div className="text-5xl font-extrabold text-orange-500/20 mb-4">03</div>
                <h3 className="text-xl font-bold text-white mb-2">Live Dashboard Tracking</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Monitor factory audit reports, inventory movement, and global cargo transit live from your personalized portal.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-900 text-xs font-mono text-orange-400">
                  → Real-time Status Updates
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 7. Dedicated Inspectors & Network Section with Professional Engineer Image */}
      <div id="inspectors">
        <section className="py-24 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Professional Field Auditing
              </span>
              <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
                Certified Inspectors with Enterprise Precision.
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Every Swiftline inspection is carried out by certified engineers equipped with precision measurement tools, safety gear, and instant digital reporting synced directly to your dashboard.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/inspector/login" className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-base font-medium rounded-full transition shadow-xl">
                  Inspector Portal Login
                </Link>
                <Link href="/inspector/apply" className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-medium rounded-full transition border border-slate-200">
                  Apply to Join Network
                </Link>
              </div>
            </div>

            {/* Right Side: Professional Engineer / Inspector Image */}
            <div className="relative mx-auto w-full max-w-md rounded-3xl bg-slate-900 p-3 shadow-2xl ring-1 ring-slate-900/10 overflow-hidden group">
              <div className="absolute top-5 right-5 z-10 bg-slate-950/80 backdrop-blur px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                EXPERT ENGINEER AUDIT
              </div>
              <img 
                src="/inspector_branding.jpg" 
                alt="Certified Professional Inspector" 
                className="rounded-2xl w-full h-auto object-cover aspect-[4/3] group-hover:scale-105 transition duration-500"
              />
              <div className="p-4 bg-slate-950 text-white rounded-2xl mt-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-mono">GLOBAL STANDARDS</div>
                  <div className="text-sm font-bold text-slate-200">Independent Factory Assessment</div>
                </div>
                <Link href="/dashboard/book-qc" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl transition">
                  Book ($99)
                </Link>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* 8. Core SaaS Features Grid */}
      <section id="features" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600">Built for Independent Importers</h2>
            <h3 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              Manage your cargo your way.
            </h3>
            <p className="text-slate-600 text-lg">
              Empowering you with complete self-service tools to route parcels and audit manufacturers without intermediaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-xl transition space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/30">
                🛡️
              </div>
              <h4 className="text-xl font-bold text-slate-900">Self-Book QC ($99)</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Trigger factory inspections yourself in 1-click. Fixed transparent pricing processed securely through Stripe.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-xl transition space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-600/30">
                📦
              </div>
              <h4 className="text-xl font-bold text-slate-900">Virtual Inventory</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Consolidate your goods and route your parcels across international hubs using your interactive client dashboard.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-xl transition space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-orange-500/30">
                ⚡
              </div>
              <h4 className="text-xl font-bold text-slate-900">Direct Tracking</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Monitor your shipment status live from factory floor to destination without ever needing to call or email an agent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Review and Star Rating Section */}
      <section id="reviews" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Verified Importer Feedback
            </span>
            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              Trusted by global sourcing leaders.
            </h2>
            <div className="flex items-center justify-center gap-1 text-amber-400 text-xl pt-2">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              <span className="text-slate-700 font-bold text-sm ml-2 font-mono">4.9 / 5.0 Rating (Over 500+ Audits)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex text-amber-400 text-sm">★★★★★</div>
              <p className="text-slate-700 text-sm italic leading-relaxed">
                &ldquo;Booking $99 QC inspections directly through the portal saved us weeks of back-and-forth communication with Chinese factories. Absolute game-changer.&rdquo;
              </p>
              <div>
                <div className="font-bold text-slate-900 text-sm">Michael Vance</div>
                <div className="text-xs text-slate-500">Supply Chain Director, Apex USA</div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex text-amber-400 text-sm">★★★★★</div>
              <p className="text-slate-700 text-sm italic leading-relaxed">
                &ldquo;The live WMS inbound tracking and instant freight aggregator saved us over 20% on shipping costs from Guangzhou to Dubai. Extremely robust platform!&rdquo;
              </p>
              <div>
                <div className="font-bold text-slate-900 text-sm">Tariq Al-Mansoor</div>
                <div className="text-xs text-slate-500">Managing Director, Dubai Hub</div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex text-amber-400 text-sm">★★★★★</div>
              <p className="text-slate-700 text-sm italic leading-relaxed">
                &ldquo;Clean interface, instant Stripe payments, and real-time inspector reports. This is what modern B2B logistics software is supposed to look like.&rdquo;
              </p>
              <div>
                <div className="font-bold text-slate-900 text-sm">Nuwan Perera</div>
                <div className="text-xs text-slate-500">Importer, Colombo Sri Lanka</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Enterprise Security & Compliance Trust Bar */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-900">🔒 SSL 256-Bit</div>
            <div className="text-xs text-slate-500 mt-1">Encrypted Data Transport</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">💳 Stripe Verified</div>
            <div className="text-xs text-slate-500 mt-1">PCI-DSS Level 1 Gateway</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">🌐 Global Nodes</div>
            <div className="text-xs text-slate-500 mt-1">Guangzhou, Dubai, Colombo</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">⚡ Instant Sync</div>
            <div className="text-xs text-slate-500 mt-1">Supabase Realtime Database</div>
          </div>
        </div>
      </section>

      {/* 11. Interactive FAQ Accordion Section */}
      <section id="faq" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600">Common Questions</h2>
            <h3 className="text-3xl lg:text-4xl font-extrabold text-slate-900">Everything you need to know</h3>
          </div>

          <div className="space-y-4">
            {[
              { q: "How does the $99 QC inspection work?", a: "You simply book through our dashboard, pay securely via Stripe, and our certified inspector on the factory floor conducts a thorough audit within 48 hours." },
              { q: "Do I need to talk to an agent to route my parcels?", a: "No! Our platform is built entirely for self-service. You configure, pay, and track your shipments directly from your personal portal." },
              { q: "How secure are my online payments?", a: "All transactions are processed through Stripe with enterprise-grade PCI-DSS Level 1 security encryption." },
              { q: "Where are your physical warehouse hubs located?", a: "We operate primary operational hubs in Guangzhou (China), Dubai (UAE), and Colombo (Sri Lanka)." }
            ].map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden transition shadow-sm">
                <button onClick={() => toggleFaq(i)} className="w-full p-6 text-left font-bold text-slate-900 flex justify-between items-center cursor-pointer">
                  <span>{faq.q}</span>
                  <span className="text-indigo-600 text-xl font-mono">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-200 pt-4 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Pricing & Call to Action */}
      <section id="pricing" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-purple-900/40 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            Transparent Self-Service Pricing
          </div>

          <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight">
            Professional Factory QC for just <span className="text-indigo-400">$99</span>
          </h2>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Take charge of your shipments today. No delayed quotations, no middlemen—just instant self-service execution.
          </p>

          <div className="pt-4">
            <Link href="/dashboard/book-qc" className="inline-flex items-center justify-center font-medium bg-indigo-600 text-white px-10 py-5 rounded-full hover:bg-indigo-700 transition shadow-2xl shadow-indigo-600/40 text-lg">
              Start Your Self-Service QC Booking →
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            Secured and processed via Stripe Enterprise Payments. Instant dashboard confirmation.
          </p>

        </div>
      </section>

      {/* 13. Professional Enterprise Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Swiftline Holdings" className="h-8 w-auto brightness-200" />
            <span className="text-sm font-medium text-slate-300">© 2026 Swiftline Holdings. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/dashboard" className="hover:text-white transition">Client Portal</Link>
            <Link href="/dashboard/book-qc" className="hover:text-white transition">Book QC</Link>
            <a href="#features" className="hover:text-white transition">Privacy Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}