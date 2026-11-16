import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* ---------------- NAVBAR ---------------- */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#0B1120]/80 border-b border-white/10 px-6 py-4 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] text-xl">S</div>
          <div className="text-2xl font-bold text-white tracking-tight">Swiftline<span className="text-blue-500">.</span></div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#features" className="hover:text-white transition">Features</Link>
          <Link href="#dual-portal" className="hover:text-white transition">For Inspectors</Link>
          <Link href="#how-it-works" className="hover:text-white transition">How it Works</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition hidden sm:block">Sign In</Link>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-6 py-2.5 rounded-full transition shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            Get Started
          </Link>
        </div>
      </nav>

      <main>
        {/* ---------------- HERO SECTION ---------------- */}
        <section className="pt-40 pb-16 px-6 text-center relative">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none -z-10"></div>
          
          <div className="max-w-5xl mx-auto relative z-10">
            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 inline-block">
              Global QC & Logistics Platform
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Import from China with <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Zero Risk & Full Control.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Book professional on-ground quality inspections, get a virtual China warehouse address, and consolidate your global freight—all on complete autopilot.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/login" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg px-8 py-4 rounded-2xl transition shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2">
                Start Shipping & QC 🚀
              </Link>
              <Link href="#how-it-works" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg px-8 py-4 rounded-2xl transition flex items-center justify-center">
                Learn How it Works
              </Link>
            </div>

            <div className="relative mx-auto w-full max-w-5xl rounded-2xl border border-white/10 p-2 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                alt="Dashboard Preview" 
                className="w-full h-auto rounded-xl opacity-80 hover:opacity-100 transition duration-500 object-cover"
                style={{ maxHeight: '500px', objectPosition: 'top' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>
        </section>

        {/* ---------------- STATS BANNER ---------------- */}
        <section className="py-10 border-y border-white/10 bg-[#060913]">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div>
              <p className="text-3xl font-bold text-white mb-1">500+</p>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Active Brands</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-400 mb-1">$50M+</p>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Goods Inspected</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400 mb-1">24 Hrs</p>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Avg. Report Time</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-400 mb-1">100%</p>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">AI Accuracy</p>
            </div>
          </div>
        </section>

        {/* ---------------- FEATURE 1: Logistics ---------------- */}
        <section id="features" className="py-24 px-6 relative overflow-hidden">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
              <span className="text-blue-500 font-bold tracking-widest uppercase text-sm mb-2 block">Warehouse & Consolidation</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">Your Own Private Warehouse in China.</h2>
              <p className="text-slate-400 text-lg mb-8">
                Stop paying crazy direct shipping rates. Send your Alibaba, Taobao, and 1688 orders to your personalized Swiftline warehouse address. We consolidate them into one box and ship it globally, saving you up to 70% on freight.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-300"><span className="text-emerald-400 text-xl">✓</span> Free 30-day storage for all parcels.</li>
                <li className="flex items-center gap-3 text-slate-300"><span className="text-emerald-400 text-xl">✓</span> Live parcel tracking via SWIFT code.</li>
                <li className="flex items-center gap-3 text-slate-300"><span className="text-emerald-400 text-xl">✓</span> Air & Sea freight dynamic calculator.</li>
              </ul>
            </div>
            <div className="w-full md:w-1/2 relative">
              <div className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-full z-0"></div>
              <img 
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop" 
                alt="Modern Warehouse" 
                className="relative z-10 w-full h-auto rounded-3xl border border-white/10 shadow-2xl object-cover aspect-video"
              />
            </div>
          </div>
        </section>

        {/* ---------------- FEATURE 2: AI QC ---------------- */}
        <section className="py-24 px-6 bg-[#060913] border-y border-white/5">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-16">
            <div className="w-full md:w-1/2">
              <span className="text-emerald-500 font-bold tracking-widest uppercase text-sm mb-2 block">Quality Control as a Service</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">Don&apos;t guess. <br/>Know exactly what you are paying for.</h2>
              <p className="text-slate-400 text-lg mb-8">
                For a flat rate of $99, deploy our verified on-ground inspectors to any factory in mainland China. Our AI engine converts raw inspector data into an executive-grade PDF report before you make the final payment to your supplier.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 px-6 py-3 rounded-xl transition font-bold">
                Book a QC Inspection →
              </Link>
            </div>
            <div className="w-full md:w-1/2 relative">
              <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full z-0"></div>
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop" 
                alt="Quality Inspection" 
                className="relative z-10 w-full h-auto rounded-3xl border border-white/10 shadow-2xl object-cover aspect-video"
              />
            </div>
          </div>
        </section>

        {/* ---------------- DUAL PORTAL SECTION ---------------- */}
        <section id="dual-portal" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">One Platform. Two Roles.</h2>
              <p className="text-slate-400">Connecting global buyers with local expertise.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#0B1120] border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/50 transition duration-500 shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -z-10 group-hover:bg-blue-600/20 transition"></div>
                <h3 className="text-2xl font-bold text-white mb-2">For Buyers & Brands 🛒</h3>
                <p className="text-slate-400 mb-8">Manage imports without ever visiting China.</p>
                <Link href="/login" className="block text-center w-full bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-600 font-bold py-3 rounded-xl transition">
                  Create Client Account
                </Link>
              </div>

              <div className="bg-[#0B1120] border border-purple-500/20 rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/50 transition duration-500 shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl -z-10 group-hover:bg-purple-600/20 transition"></div>
                <h3 className="text-2xl font-bold text-white mb-2">For Local Inspectors 🕵️‍♂️</h3>
                <p className="text-slate-400 mb-8">Turn factory visits into a steady income stream.</p>
                <Link href="/login" className="block text-center w-full bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/30 hover:border-purple-600 font-bold py-3 rounded-xl transition">
                  Have an Invite Code? Join Here
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- TESTIMONIALS ---------------- */}
        <section className="py-24 px-6 bg-[#060913] border-y border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trusted by Global E-Commerce</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0B1120] p-8 rounded-3xl border border-white/10">
                <div className="text-blue-500 text-2xl mb-4">★★★★★</div>
                <p className="text-slate-300 italic mb-6">&quot;Swiftline saved my Amazon FBA business. The AI QC report caught a major defect in my $15,000 order before I made the final payment.&quot;</p>
                <div>
                  <p className="font-bold text-white">David Miller</p>
                  <p className="text-xs text-slate-500">Amazon Seller, USA</p>
                </div>
              </div>
              <div className="bg-[#0B1120] p-8 rounded-3xl border border-white/10">
                <div className="text-blue-500 text-2xl mb-4">★★★★★</div>
                <p className="text-slate-300 italic mb-6">&quot;The consolidation warehouse is a game changer. I buy from 5 different Taobao sellers, and Swiftline packs it all into one box for cheap shipping.&quot;</p>
                <div>
                  <p className="font-bold text-white">Sarah Jenkins</p>
                  <p className="text-xs text-slate-500">Boutique Owner, UK</p>
                </div>
              </div>
              <div className="bg-[#0B1120] p-8 rounded-3xl border border-white/10">
                <div className="text-blue-500 text-2xl mb-4">★★★★★</div>
                <p className="text-slate-300 italic mb-6">&quot;As an inspector based in Guangzhou, the app makes it so easy to pick up jobs, snap photos, and get paid instantly. Highly recommended.&quot;</p>
                <div>
                  <p className="font-bold text-white">Chen Wei</p>
                  <p className="text-xs text-slate-500">Freelance Inspector, China</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- HOW IT WORKS ---------------- */}
        <section id="how-it-works" className="py-24 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How Swiftline Works</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">A fully automated ecosystem bridging international buyers with on-ground quality control and logistics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#060913] border border-white/5 p-8 rounded-3xl text-center hover:-translate-y-2 transition duration-300">
                <div className="text-5xl mb-4">1️⃣</div>
                <h3 className="text-xl font-bold text-white mb-2">Book Inspection</h3>
                <p className="text-slate-400 text-sm">Client submits factory details and pays a flat $99 fee via our secure Stripe gateway.</p>
              </div>
              <div className="bg-[#060913] border border-white/5 p-8 rounded-3xl text-center hover:-translate-y-2 transition duration-300">
                <div className="text-5xl mb-4">2️⃣</div>
                <h3 className="text-xl font-bold text-white mb-2">Ground Team Deploys</h3>
                <p className="text-slate-400 text-sm">Our verified local inspectors accept the job, visit the factory, and upload raw photos/notes.</p>
              </div>
              <div className="bg-[#060913] border border-white/5 p-8 rounded-3xl text-center hover:-translate-y-2 transition duration-300">
                <div className="text-5xl mb-4">3️⃣</div>
                <h3 className="text-xl font-bold text-white mb-2">AI Report & Shipping</h3>
                <p className="text-slate-400 text-sm">Swiftline AI generates a pro report. If approved, we ship the goods globally using dynamic courier rates.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- CTA FOOTER ---------------- */}
        <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-[#0B1120] to-[#04060d]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Scale your sourcing. <br/>Zero touch required.</h2>
            <p className="text-slate-400 text-lg mb-10">Join Swiftline today and experience fully automated freight and quality control.</p>
            <Link href="/login" className="bg-white text-black hover:bg-slate-200 font-bold text-lg px-12 py-5 rounded-full transition shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Get Started for Free
            </Link>
          </div>
        </section>

      </main>

      {/* ---------------- STANDARD FOOTER ---------------- */}
      <footer className="py-12 px-6 border-t border-white/10 bg-[#04060d]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">S</div>
              <div className="text-lg font-bold text-white tracking-tight">Swiftline<span className="text-blue-500">.</span></div>
            </div>
            <p className="text-slate-500 text-sm">Global WMS & QC Arbitrage Platform.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/login" className="hover:text-blue-400">Client Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-blue-400">Inspector Hub</Link></li>
              <li><Link href="/login" className="hover:text-blue-400">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-blue-400">About Us</Link></li>
              <li><Link href="#" className="hover:text-blue-400">Careers</Link></li>
              <li><Link href="#" className="hover:text-blue-400">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-blue-400">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-blue-400">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-slate-600 text-sm pt-8 border-t border-white/5">
          <p>© 2026 Swiftline Holdings. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}