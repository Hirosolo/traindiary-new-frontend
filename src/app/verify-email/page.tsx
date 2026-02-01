'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_HOST || '/api';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    if (!token) return;

    const verifyByToken = async () => {
      setIsLoading(true);
      setStatus({ type: 'info', message: 'Verifying your email...' });
      try {
        const response = await fetch(`${API_BASE}/auth/verify?token=${encodeURIComponent(token)}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Verification failed');
        }

        setStatus({ type: 'success', message: 'Email verified successfully. You can now sign in.' });
      } catch (error) {
        setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Verification failed' });
      } finally {
        setIsLoading(false);
      }
    };

    verifyByToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    try {
      const response = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Verification failed');
      }

      setStatus({ type: 'success', message: 'Email verified successfully. You can now sign in.' });
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Verification failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center overflow-x-hidden bg-black">
      <main className="relative z-10 w-full max-w-md px-8 pt-16 pb-safe flex flex-col min-h-screen">
        <div className="flex justify-start">
          <Link
            href="/"
            className="text-xl font-bold font-display tracking-architectural hover:text-electric-blue transition-colors"
          >
            TrainDiary
          </Link>
        </div>

        <div className="mt-16 mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-electric-blue drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] mb-3">
            ASCENT PERFORMANCE
          </p>
          <h1 className="font-montserrat text-4xl font-extrabold tracking-tighter uppercase leading-none text-white drop-shadow-2xl">
            Verify<br /><span className="text-white">Email</span>
          </h1>
        </div>

        <div className="flex-1 flex flex-col">
          <form className="space-y-7" onSubmit={handleSubmit}>
            {status && (
              <div
                className={
                  status.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : status.type === 'error'
                      ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                      : 'bg-white/10 border border-white/20 text-white/80'
                }
              >
                <div className="px-4 py-3 rounded text-sm">{status.message}</div>
              </div>
            )}

            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-dim group-focus-within:text-electric-blue transition-colors">
                Verification Code
              </label>
              <input
                type="text"
                name="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6-digit code"
                required
                minLength={6}
                maxLength={6}
                disabled={isLoading}
                className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-3 text-sm focus:ring-0 focus:border-electric-blue transition-all duration-300 placeholder:text-white/10 group-focus-within:!border-electric-blue disabled:opacity-50"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-electric-blue border border-electric-blue text-white py-5 rounded-none transition-all duration-300 hover:bg-blue-600 active:scale-[0.98] shadow-[0_0_30px_rgba(59,130,246,0.4),inset_0_0_10px_rgba(59,130,246,0.2)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-black text-xs uppercase tracking-[0.5em] text-white">
                  {isLoading ? 'VERIFYING...' : 'Verify Email'}
                </span>
              </button>
            </div>

            <div className="pt-8 text-center">
              <Link
                href="/signin"
                className="text-text-dim text-[10px] font-bold tracking-[0.15em] uppercase hover:text-electric-blue transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
