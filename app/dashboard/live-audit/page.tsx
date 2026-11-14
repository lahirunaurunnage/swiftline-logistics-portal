 "use client";
import { useState } from "react";
import Link from "next/link";

export default function LiveAuditPage() {
  const [roomName, setRoomName] = useState("Swiftline-QC-Room-01");
  const [inCall, setInCall] = useState(false);

  const startLiveAudit = (e: React.FormEvent) => {
    e.preventDefault();
    setInCall(true);
    // මෙහිදී Twilio Video SDK හරහා සජීවී වීඩියෝ ස්ට්‍රීම් එක ලෝඩ් වේ
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Live Factory & QC Video Audit 🎥</h1>
            <p className="text-slate-400 text-sm">Guangzhou ගබඩාවේ සිදුවන සජීවී පරීක්ෂාවන් නිරීක්ෂණය කරන්න.</p>
          </div>
          <Link href="/dashboard" className="text-sm bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 transition">
            Back to Dashboard
          </Link>
        </div>

        {!inCall ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md text-center max-w-lg mx-auto">
            <div className="text-5xl mb-4">🔴</div>
            <h2 className="text-xl font-bold text-white mb-2">Connect to Live Warehouse Feed</h2>
            <p className="text-slate-400 text-sm mb-6">ඔබේ ඇණවුම පරීක්ෂා කරන අවස්ථාවේදී සජීවී වීඩියෝ ඇමතුමක් ආරම්භ කරන්න.</p>
            
            <form onSubmit={startLiveAudit} className="space-y-4">
              <input 
                type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Room Name" 
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-center font-mono font-bold"
              />
              <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl transition shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                Start Live Video Session 🔴
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-black border border-white/10 rounded-3xl p-6 text-center space-y-4">
            <div className="w-full h-96 bg-slate-900 rounded-2xl flex flex-col items-center justify-center border border-white/10 relative overflow-hidden">
              <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-2">
                <span>●</span> LIVE STREAM ACTIVE
              </div>
              <div className="text-6xl mb-2">📹</div>
              <p className="text-slate-400 text-sm">Connected to Guangzhou Warehouse Room: <span className="text-white font-mono">{roomName}</span></p>
            </div>
            <button onClick={() => setInCall(false)} className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm">
              End Call / Leave Room
            </button>
          </div>
        )}

      </div>
    </div>
  );
}