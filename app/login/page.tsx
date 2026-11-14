 "use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); 
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter(); // Redirect කිරීම සඳහා

  const handleAuth = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignUp) {
      // අලුත් ගිණුමක් සෑදීම (Sign Up)
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setMessage('දෝෂයකි: ' + error.message);
      } else {
        setMessage('ගිණුම සාර්ථකව සෑදුවා! කරුණාකර ඔබගේ ඊමේල් ගිණුම පරීක්ෂා කර එය තහවුරු (Verify) කරන්න.');
      }
    } else {
      // දැනටමත් ඇති ගිණුමකට ලොග් වීම (Sign In)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage('ඊමේල් ලිපිනය හෝ මුරපදය වැරදියි!');
      } else {
        setMessage('සාර්ථකව ලොග් වුණා! ඔබව දැන් ප්‍රධාන පිටුවට යොමු කෙරේ...');
        // තත්පරයකින් පසු Dashboard එකට යැවීම (පණිවිඩය කියවන්න කුඩා වෙලාවක් දීමට)
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Swiftline Logistics
          </h1>
          <p className="text-slate-500">
            {isSignUp ? 'නව පාරිභෝගික ගිණුමක් සාදාගන්න' : 'ඔබගේ ගිණුමට ලොග් වන්න'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ඊමේල් ලිපිනය</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">මුරපදය (Password)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition duration-200"
          >
            {loading ? 'කරුණාකර රැඳී සිටින්න...' : (isSignUp ? 'ගිණුම සාදන්න' : 'ලොග් වන්න')}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm text-center ${message.includes('දෝෂයකි') || message.includes('වැරදියි') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-slate-600">
          {isSignUp ? 'දැනටමත් ගිණුමක් තිබෙනවාද? ' : 'තවමත් ගිණුමක් නැද්ද? '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage('');
            }}
            className="text-blue-600 font-semibold hover:underline"
          >
            {isSignUp ? 'ලොග් වන්න' : 'නව ගිණුමක් සාදන්න'}
          </button>
        </div>
      </div>
    </div>
  );
}