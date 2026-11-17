 "use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Account Type Switcher ('client' or 'inspector')
  const [accountType, setAccountType] = useState<'client' | 'inspector'>('client');
  
  // Expanded Inspector Registration States (CV & Details)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [warehouseZone, setWarehouseZone] = useState('Guangzhou Zone A');
  const [experienceYears, setExperienceYears] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  
  const [isSignUp, setIsSignUp] = useState(false); 
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter(); 

  const handleAuth = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignUp) {
      try {
        // 1. Sign Up Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          let cvPublicUrl = '';

          // 2. Upload CV File to Supabase Storage if user is registering as an Inspector
          if (accountType === 'inspector' && cvFile) {
            const fileExt = cvFile.name.split('.').pop() || 'pdf';
            const fileName = `${authData.user.id}/${Date.now()}_cv.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from('inspector-cvs')
              .upload(fileName, cvFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('inspector-cvs')
              .getPublicUrl(fileName);

            cvPublicUrl = publicUrl;
          }

          // 3. Save profile details based on account type
          const assignedRole = accountType === 'inspector' ? 'inspector' : 'client';
          const accountStatus = accountType === 'inspector' ? 'Pending Approval' : 'Active';

          const profilePayload: any = {
            id: authData.user.id,
            role: assignedRole,
            status: accountStatus,
            wallet_balance: 0.00,
            swift_code: `SWIFT-${Math.floor(1000 + Math.random() * 9000)}`
          };

          if (accountType === 'inspector') {
            profilePayload.full_name = fullName.trim();
            profilePayload.phone = phone.trim();
            profilePayload.warehouse_location = warehouseZone;
            profilePayload.experience_years = experienceYears;
            profilePayload.specialization = specialization;
            profilePayload.cv_url = cvPublicUrl;
          }

          const { error: profileError } = await supabase.from('profiles').upsert(profilePayload);

          if (profileError) throw profileError;

          setMessage(
            assignedRole === 'inspector' 
              ? 'success: Inspector application & CV submitted successfully! Waiting for Admin verification.' 
              : 'success: Client account created successfully! Please sign in.'
          );
          
          setTimeout(() => {
            setIsSignUp(false);
            setFullName('');
            setPhone('');
            setExperienceYears('');
            setSpecialization('');
            setCvFile(null);
          }, 3000);
        }
      } catch (err: any) {
        setMessage('error: ' + err.message);
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
          .select('role, status')
          .eq('id', data.user.id)
          .single();

        const userRole = profileData?.role || 'client';
        const userStatus = profileData?.status || 'Active';

        if (userRole === 'inspector' && userStatus === 'Pending Approval') {
          setMessage('error: Your inspector account is still pending admin approval.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

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
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] text-slate-200 font-sans p-6 relative">
      
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 transition flex items-center gap-2">
          ← Back to Home
        </Link>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="bg-[#060913] p-8 sm:p-10 rounded-3xl shadow-2xl max-w-xl w-full border border-white/10 relative z-10 my-10">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xl mx-auto mb-4 shadow-[0_0_15px_rgba(37,99,235,0.5)]">S</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Swiftline Logistics
          </h1>
          <p className="text-slate-400 text-sm">
            {isSignUp ? 'Choose your account type and register' : 'Sign in to manage your shipments'}
          </p>
        </div>

        {/* Account Type Selector for Sign Up */}
        {isSignUp && (
          <div className="flex bg-black/50 p-1.5 rounded-2xl border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => setAccountType('client')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${accountType === 'client' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              👤 Client Account
            </button>
            <button
              type="button"
              onClick={() => setAccountType('inspector')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${accountType === 'inspector' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              🕵️‍♂️ Factory Inspector (CV)
            </button>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Expanded Inspector Registration Details & CV Upload (Only when Sign Up & Inspector selected) */}
          {isSignUp && accountType === 'inspector' && (
            <div className="bg-purple-950/20 border border-purple-500/30 p-4 rounded-2xl space-y-4">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Inspector Application Details</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition text-xs"
                    placeholder="e.g. Lahiru Madusanka"
                    required={isSignUp && accountType === 'inspector'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition text-xs font-mono"
                    placeholder="+94 77 000 0000"
                    required={isSignUp && accountType === 'inspector'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Preferred Zone</label>
                  <select
                    value={warehouseZone}
                    onChange={(e) => setWarehouseZone(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition text-xs"
                  >
                    <option value="Guangzhou Zone A">Guangzhou Zone A (Electronics)</option>
                    <option value="Guangzhou Zone B">Guangzhou Zone B (Apparel)</option>
                    <option value="Guangzhou Zone C">Guangzhou Zone C (General Cargo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Experience (Years)</label>
                  <input
                    type="text"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition text-xs"
                    placeholder="e.g. 5 Years"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Specialization / Expertise</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition text-xs"
                  placeholder="e.g. Electronics, CNC Machining, Apparel QC"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Upload CV / Resume (PDF)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => { if (e.target.files) setCvFile(e.target.files[0]); }}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600/20 file:text-purple-400 hover:file:bg-purple-600/30 transition cursor-pointer"
                  required={isSignUp && accountType === 'inspector'}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition text-xs"
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
              className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition text-xs"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-3.5 rounded-xl transition shadow-lg mt-3 text-xs uppercase tracking-wider cursor-pointer text-white ${
              isSignUp && accountType === 'inspector' 
                ? 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)]' 
                : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
            }`}
          >
            {loading ? 'Processing...' : (isSignUp ? (accountType === 'inspector' ? 'Submit Inspector Application & CV' : 'Create Client Account') : 'Sign In')}
          </button>
        </form>

        {/* Alert Messages */}
        {message && (
          <div className={`mt-6 p-4 rounded-xl text-xs font-medium text-center border ${
            message.startsWith('error') 
              ? 'bg-red-500/10 border-red-500/20 text-red-400' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            {message.replace(/^(success|error):\s*/, '')}
          </div>
        )}

        <div className="mt-8 text-center text-xs text-slate-400 border-t border-white/10 pt-6">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage('');
              setAccountType('client');
            }}
            className="text-blue-400 font-bold hover:text-blue-300 transition cursor-pointer"
          >
            {isSignUp ? 'Sign In Here' : 'Create an Account'}
          </button>
        </div>
        
      </div>
    </div>
  );
}