'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, User, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function UserLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false);
    // Demo: any credentials work
    router.push('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans text-gray-800">
      {/* Container */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-blue-50 text-[#387ed1]">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Sentinel Portal
          </h1>
          <p className="text-gray-500 text-sm mt-1.5 font-medium">Sentinel Fraud Platform · User Login</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="analyst@sentinel.ai"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#387ed1] transition-all bg-white"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#387ed1] transition-all bg-white"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 text-[#387ed1] rounded border-gray-300 focus:ring-[#387ed1]" />
              Remember me
            </label>
            <button type="button" className="text-[#387ed1] hover:text-blue-800 transition-colors font-semibold">
              Forgot password?
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-3 rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg font-bold text-sm text-white transition-all bg-[#387ed1] hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2 mt-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating…</> : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Server login link */}
        <a href="/server-login"
          className="w-full py-2.5 rounded-lg font-semibold text-sm text-gray-600 border border-gray-200 bg-gray-50 hover:bg-white hover:text-gray-900 transition-colors flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-gray-400" />
          Server / Admin Login
        </a>

        <p className="text-center text-xs text-gray-400 mt-8 font-medium">
          Protected by Sentinel - AI Fraud Detection System
        </p>
      </div>
    </div>
  );
}
