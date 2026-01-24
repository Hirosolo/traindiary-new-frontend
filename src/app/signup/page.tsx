'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await register(formData.fullName, formData.email, formData.password);
      // Router push is handled in AuthContext after successful registration and login
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          alt="High-end Weights Close-up"
          className="w-full h-full object-cover brightness-[1.8] contrast-[1.4] scale-105"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcUXH4ifrq2QS9tctcHzm-hb-u6qaAnVK2YQEDhKIx92bj5jUdFensoT4AHlqKtMlWx2QbxzKHOHK_fSyt1uYFIPT8scQEsfkPt8FMCNyITtjNKB5JUaDn09BLLID2ECNcJqriz_NFyAX8ZlSDNOJETmdjukK5STDkBjDD4ybNKhhUD_2VdKebsU6PSTqQtgiTmhcX4v7rjN2jZ0BjNt7ozKrpVn8DLpiY1mvSkThSt4Kv3XXrqhjCVY6whslqTPrPL1e0Q-gJomQ"
        />
        {/* Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_50%_20%,rgba(255,255,255,0.08),transparent_80%)]"></div>
        {/* Blue glow */}
        <div className="absolute top-0 right-0 w-[80%] h-[60%] bg-gradient-to-bl from-electric-blue/20 via-transparent to-transparent opacity-60 mix-blend-screen"></div>
        {/* Light line */}
        <div className="absolute bottom-[20%] left-[-10%] w-[100%] h-[1px] bg-electric-blue/40 shadow-[0_0_40px_rgba(59,130,246,0.8)] rotate-12"></div>
        {/* Accent line */}
        <div className="absolute top-1/4 right-0 w-2/3 h-[2px] bg-white/20 shadow-[0_0_30px_rgba(255,255,255,0.6)] opacity-50 -rotate-12"></div>
        {/* Cinematic overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.15)_0%,transparent_50%),linear-gradient(to_bottom,rgba(0,0,0,0.2)_0%,rgba(2,2,2,0.7)_40%,rgba(0,0,0,1)_100%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-md px-8 pt-16 pb-safe flex flex-col min-h-screen">
        <div className="flex justify-start">
          <Link
            href="/"
            className="text-xl font-bold font-display tracking-architectural hover:text-electric-blue transition-colors"
          >
            TrainDiary
          </Link>
        </div>
        {/* Header */}
        <div className="mt-16 mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-electric-blue drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] mb-3">
            ASCENT PERFORMANCE
          </p>
          <h1 className="font-montserrat text-4xl font-extrabold tracking-tighter uppercase leading-none text-white drop-shadow-2xl">
            Create<br /><span className="text-white">Access</span>
          </h1>
        </div>

        {/* Form Section */}
        <div className="flex-1 flex flex-col">
          <form className="space-y-7" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-dim group-focus-within:text-electric-blue transition-colors">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                required
                disabled={isLoading}
                className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-3 text-sm focus:ring-0 focus:border-electric-blue transition-all duration-300 placeholder:text-white/10 group-focus-within:!border-electric-blue disabled:opacity-50"
              />
            </div>

            {/* Email */}
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-dim group-focus-within:text-electric-blue transition-colors">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@performance.com"
                required
                disabled={isLoading}
                className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-3 text-sm focus:ring-0 focus:border-electric-blue transition-all duration-300 placeholder:text-white/10 group-focus-within:!border-electric-blue disabled:opacity-50"
              />
            </div>

            {/* Phone */}
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-dim group-focus-within:text-electric-blue transition-colors">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                disabled={isLoading}
                className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-3 text-sm focus:ring-0 focus:border-electric-blue transition-all duration-300 placeholder:text-white/10 group-focus-within:!border-electric-blue disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div className="group relative">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-dim group-focus-within:text-electric-blue transition-colors">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                disabled={isLoading}
                className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-3 text-sm focus:ring-0 focus:border-electric-blue transition-all duration-300 placeholder:text-white/10 group-focus-within:!border-electric-blue disabled:opacity-50"
              />
              <div className="flex justify-end mt-2">
                <Link
                  href="/forgot-password"
                  className="text-[9px] font-bold tracking-[0.15em] text-white/40 hover:text-white uppercase transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-electric-blue border border-electric-blue text-white py-5 rounded-none transition-all duration-300 hover:bg-blue-600 active:scale-[0.98] shadow-[0_0_30px_rgba(59,130,246,0.4),inset_0_0_10px_rgba(59,130,246,0.2)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-black text-xs uppercase tracking-[0.5em] text-white">
                  {isLoading ? 'CREATING...' : 'Start Ascent'}
                </span>
              </button>
            </div>

            {/* Quick Access */}
            <div className="mt-12">
              <div className="relative flex items-center mb-8">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">
                  Quick Access
                </span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>
              <div className="flex justify-center gap-8">
                {/* Google */}
                <button
                  type="button"
                  className="w-12 h-12 flex items-center justify-center border border-white/20 bg-black/60 backdrop-blur-md rounded-full hover:border-electric-blue transition-all group"
                >
                  <svg className="w-5 h-5 fill-white/60 group-hover:fill-white" viewBox="0 0 24 24">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"></path>
                  </svg>
                </button>
                {/* Apple */}
                <button
                  type="button"
                  className="w-12 h-12 flex items-center justify-center border border-white/20 bg-black/60 backdrop-blur-md rounded-full hover:border-electric-blue transition-all group"
                >
                  <svg className="w-5 h-5 fill-white/60 group-hover:fill-white" viewBox="0 0 24 24">
                    <path d="M17.05,20.28c-0.96,0.95-2.05,1.72-3.38,1.72-1.33,0-2.25-0.77-3.38-1.72-2.11-1.78-2.11-1.78-4.22,0-1.13,0.95-2.22,1.72-3.55,1.72-1.33,0-2.42-0.77-3.38-1.72-1.92-1.92-1.92-5.02,0-6.94,1.92-1.92,5.02-1.92,6.94,0,0,0,0,0,0,0l0.55,0.55,0.55-0.55c1.92-1.92,5.02-1.92,6.94,0l0,0C18.97,15.26,18.97,18.36,17.05,20.28z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-auto py-10 text-center">
          <p className="text-text-dim text-[10px] font-bold tracking-[0.15em] uppercase">
            Already a member?
            <Link href="/signin" className="text-white hover:text-electric-blue transition-colors ml-1 underline decoration-electric-blue decoration-2 underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </main>

      {/* Mobile indicator */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 h-1 w-32 bg-white/20 rounded-full lg:hidden"></div>
    </div>
  );
}
