'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Server, Eye, EyeOff, User, Lock, Key, AlertTriangle, ShieldAlert, Loader2, Terminal } from 'lucide-react';

export default function ServerLoginPage() {
  const router = useRouter();
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [mfaCode, setMfaCode]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [step, setStep]           = useState<'creds' | 'mfa'>('creds');

  async function handleCreds(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!username || !password) { setError('Enter admin credentials to continue.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setStep('mfa');
  }

  async function handleMfa(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (mfaCode.length !== 6) { setError('MFA code must be 6 digits.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    router.push('/admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans text-gray-800">

      <div className="w-full max-w-md">
        {/* Warning banner */}
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg text-xs font-semibold text-orange-800 bg-orange-50 border border-orange-100 shadow-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-orange-600" />
          <span>RESTRICTED ACCESS — Authorised Personnel Only. All activity is logged.</span>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">

          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 relative bg-gray-100 border border-gray-200 text-gray-700 shadow-sm">
              <Server className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                <ShieldAlert className="w-2.5 h-2.5 text-white" />
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Server Console
            </h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">FFDS · Administrative Access</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 bg-gray-800`} />
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step === 'mfa' ? 'bg-gray-800' : 'bg-gray-200'}`} />
          </div>

          {step === 'creds' ? (
            <form onSubmit={handleCreds} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">Admin Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="root@ffds-server"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all font-mono bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">Admin Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all font-mono bg-gray-50"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-3 rounded-lg border border-red-100">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-lg font-bold text-sm text-white transition-all bg-gray-900 hover:bg-black disabled:opacity-70 flex items-center justify-center gap-2 mt-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials…</> : 'Continue →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMfa} className="space-y-5">
              <div className="flex items-center gap-2 px-3 py-3 rounded-lg mb-2 bg-gray-50 border border-gray-200">
                <Terminal className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <p className="text-xs text-gray-600 font-medium">Credentials verified. Enter 6-digit MFA code from your authenticator app.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wider">MFA / 2FA Code</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={mfaCode}
                    onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all font-mono tracking-[0.4em] text-center text-xl bg-white"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-2 text-center font-medium">Code refreshes every 30 seconds</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-3 rounded-lg border border-red-100">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-lg font-bold text-sm text-white transition-all bg-gray-900 hover:bg-black disabled:opacity-70 flex items-center justify-center gap-2 mt-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating Server Session…</> : 'Access Console'}
              </button>

              <button type="button" onClick={() => { setStep('creds'); setError(''); }}
                className="w-full text-center text-sm font-semibold text-gray-500 hover:text-gray-900 pt-2 transition-colors">
                ← Back to credentials
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-400 mt-8 font-medium">
            Unauthorised access attempts are reported automatically.
          </p>
        </div>

        {/* Bottom link */}
        <p className="text-center text-sm text-gray-500 mt-6 font-medium">
          Not an admin?{' '}
          <a href="/login" className="text-[#387ed1] hover:text-blue-800 transition-colors font-bold">User Login →</a>
        </p>
      </div>
    </div>
  );
}
