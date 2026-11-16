 "use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Back button එකට

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BookQCPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  const [productName, setProductName] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState(""); // අලුතින් එකතු කළා
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        router.push("/login");
      }
    };
    getUser();
  }, [router]);

  const handleBookingAndPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please login first!");
    setLoading(true);

    try {
      // කෙලින්ම අපේ Checkout API එකට ඩේටා යවනවා (Webhook එකෙන් තමයි DB එකට සේව් කරන්නේ)
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          supplierContact,
          quantity,
          location,
          specialNotes: notes,
          clientId: user.id
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        // Stripe Payment පිටුවට යවනවා
        window.location.href = data.url;
      } else {
        alert("Checkout Error: " + (data.error || "Failed to connect to Stripe."));
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Error initiating payment!");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans p-6 sm:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Button එකක් එකතු කළා */}
        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center gap-2 mb-6 w-fit">
          ← Back to Dashboard
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Book an Inspection 🔎</h1>
          <p className="text-slate-400">Flat rate <b>$99.00</b> anywhere in mainland China.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#060913] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -z-10"></div>
            
            <h2 className="text-xl font-bold text-white mb-6">Supplier & Product Details</h2>
            <form id="booking-form" onSubmit={handleBookingAndPayment} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">PRODUCT NAME / LINK</label>
                <input type="text" required value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. 500x Smart Watches" className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">SUPPLIER WECHAT</label>
                  <input type="text" required value={supplierContact} onChange={(e) => setSupplierContact(e.target.value)} placeholder="e.g. WeChat: Factory_88" className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">QUANTITY</label>
                  <input type="number" required value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 500" className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">FACTORY LOCATION (CITY)</label>
                <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Shenzhen, Guangdong" className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">SPECIAL INSTRUCTIONS</label>
                <textarea rows={3} required value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Please check for screen scratches..." className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition"></textarea>
              </div>
              
              <button type="submit" disabled={loading} className="w-full lg:hidden bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                {loading ? "Connecting to Stripe..." : "Pay $99.00 & Book QC"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-blue-900/10 border border-blue-500/20 rounded-3xl p-6 sticky top-6 backdrop-blur-md">
              <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
              <div className="flex justify-between text-sm mb-4"><span className="text-slate-400">Standard QC</span><span className="text-white font-medium">$99.00</span></div>
              <div className="pt-4 border-t border-white/10 flex justify-between mb-6">
                <span className="text-white font-bold">Total</span><span className="text-2xl font-bold text-white">$99.00</span>
              </div>
              
              {/* Form එකට කනෙක්ට් කරපු බොත්තම */}
              <button type="submit" form="booking-form" disabled={loading || !productName} className="hidden lg:block w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition">
                {loading ? "Connecting to Stripe..." : "Pay $99.00 & Book"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}