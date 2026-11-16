 "use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); 
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter(); 

  const handleAuth = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignUp) {
      // Sign Up Logic
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setMessage('error: ' + authError.message);
      } else if (authData.user) {
        
        // VIP Code check for Inspectors
        const assignedRole = inviteCode === 'VIP-INSPECTOR-2026' ? 'inspector' : 'client';

        await supabase.from('profiles').upsert({
          id: authData.user.id,
          role: assignedRole,
          swift_code: `SWIFT-${Math.floor(1000 + Math.random() * 9000)}` 
        });

        setMessage(
          assignedRole === 'inspector' 
            ? 'success: Inspector account created successfully!' 
            : 'success: Client account created! Please sign in.'
        );
        
        setTimeout(() => setIsSignUp(false), 2000);
      }
    } else {
      // Sign In Logic
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setMessage('error: Invalid email or password.');
      } else if (data?.user) {
        setMessage('success: Authenticating... Please wait.');
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const userRole = profileData?.role || 'client';
        let redirectPath = '/dashboard'; 
        
        if (userRole === 'admin') {
          redirectPath = '/admin/qc'; 
        } else if (userRole === 'inspector') {
          redirectPath = '/inspector'; 
        }

        setTimeout(() => router.push(redirectPath), 1000);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] text-slate-200 font-sans p-6">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="bg-[#060913] p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full border border-white/10 relative z-10">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xl mx-auto mb-4 shadow-[0_0_15px_rgba(37,99,235,0.5)]">S</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Swiftline Logistics
          </h1>
          <p className="text-slate-400 text-sm">
            {isSignUp ? 'Create your global sourcing account' : 'Sign in to manage your shipments'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition"
              placeholder="name@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Invite Code Field (Only shown during Sign Up) */}
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                <span>Inspector Invite Code</span> 
                <span className="text-slate-500">Optional</span>
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full bg-blue-900/10 border border-blue-500/30 text-blue-400 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition font-mono uppercase"
                placeholder="e.g. VIP-INSPECTOR-2026"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-xl transition shadow-[0_0_15px_rgba(37,99,235,0.4)] mt-2"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Alert Messages */}
        {message && (
          <div className={`mt-6 p-4 rounded-xl text-sm font-medium text-center border ${
            message.startsWith('error') 
              ? 'bg-red-500/10 border-red-500/20 text-red-400' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            {message.replace(/^(success|error):\s*/, '')}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-slate-400 border-t border-white/10 pt-6">
          {isSignUp ? 'Already have an account? ' : 'New to Swiftline? '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage('');
              setInviteCode('');
            }}
            className="text-blue-400 font-bold hover:text-blue-300 transition"
          >
            {isSignUp ? 'Sign In Here' : 'Create an Account'}
          </button>
        </div>
        
      </div>
    </div>
  );
}