 "use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardSupport() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSupportData = async () => {
      // 1. Authenticate user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // 2. Fetch User Profile (SWIFT Code)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profileData) setProfile(profileData);

      // 3. Fetch Real Tickets from Supabase 'tickets' table
      const { data: ticketData } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ticketData) {
        setTickets(ticketData);
      }
      setLoading(false);
    };

    fetchSupportData();
  }, [router]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    setSubmitting(true);

    // Insert new ticket into Supabase 'tickets' table
    const { data, error } = await supabase
      .from("tickets")
      .insert([
        {
          user_id: user.id,
          subject: subject,
          description: description,
          status: "Open"
        }
      ])
      .select();

    if (error) {
      alert("Error creating ticket: " + error.message);
    } else {
      alert("Support ticket created successfully!");
      if (data) {
        setTickets([data[0], ...tickets]);
      }
      setSubject("");
      setDescription("");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1120] text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm tracking-widest uppercase">Loading Support Center...</p>
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
        
        {/* Sub Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit mb-8 border border-white/5 backdrop-blur-md overflow-x-auto">
          <Link href="/dashboard" className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2">
            <span>📊</span> Overview
          </Link>
          <Link href="/dashboard/inventory" className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2">
            <span>📦</span> Inventory
          </Link>
          <Link href="/dashboard/qc" className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2">
            <span>🛡️</span> QC Viewer
          </Link>
          <Link href="/dashboard/support" className="px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white shadow-lg shadow-blue-900/50 flex items-center gap-2">
            <span>🎧</span> Support
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Open Ticket Form */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Open a Support Ticket</h2>
            <p className="text-slate-400 text-sm mb-6">භාණ්ඩයක් ආපසු යැවීමට (Return) හෝ වෙනත් ගැටලුවක් සඳහා ටිකට් එකක් විවෘත කරන්න.</p>
            
            <form onSubmit={handleCreateTicket} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject / Topic</label>
                <input 
                  type="text" value={subject} onChange={(e) => setSubject(e.target.value)} 
                  placeholder="e.g. Return request for defective item..." 
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-medium" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  rows={4} value={description} onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Explain the issue clearly..." 
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-medium" 
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-4 rounded-xl transition shadow-lg"
              >
                {submitting ? "Submitting Ticket..." : "Submit Support Ticket"}
              </button>
            </form>
          </div>

          {/* Previous Tickets List */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Your Support History</h2>
            
            {tickets.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>තවම විවෘත කළ ටිකට්පත් නොමැත.</p>
                <p className="text-xs mt-1">No support tickets found.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {tickets.map((t) => (
                  <div key={t.id} className="bg-black/30 border border-white/5 p-5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-base">{t.subject}</h4>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        t.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        t.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{t.description}</p>
                    <div className="text-right text-xs text-slate-500 pt-1">
                      {new Date(t.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}