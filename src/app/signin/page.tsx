'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign in form submitted:', formData);
    // Handle sign in logic here
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img
          alt="Cinematic Low Angle Barbell"
          className="w-full h-full object-cover brightness-[0.7] contrast-[1.25] scale-110 object-right"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4FGuNet_rruDiatEBadRiQvPQfiR2XEYNXfvwyJNRhuRn1adErZLhUgMARn_mLRJwfKoExSs3uCijbi3h59Wrr8nbVDsJsN4PaFkoIl5zYhrtbpAGJhBDQUFJWkFQzLUdMt02DYwqcPfF4qeYJ4IffqJyMXv74gqIVjnl4jixkU6EdJfYye2PXi0jB6Qk-Cui06BwIss3S6UqsggOg_vAhidgTIuEPDJu7KcDvcqkWYGSInO2lpw1q-N2fIbOy9Wr-D5Prx3z8rA"
        />
        {/* Rim light */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.4)_0%,transparent_40%)] mix-blend-screen opacity-60"></div>
        {/* Blue glow */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-electric-blue/20 via-transparent to-transparent"></div>
        {/* Blue line */}
        <div className="absolute top-1/3 right-[-10%] w-[60%] h-[2px] bg-electric-blue/60 shadow-[0_0_40px_rgba(59,130,246,0.8)] -rotate-12 blur-[1px]"></div>
        {/* Light line */}
        <div className="absolute bottom-1/4 left-0 w-[40%] h-[1px] bg-electric-blue/30 shadow-[0_0_20px_rgba(59,130,246,0.4)] opacity-60"></div>
        {/* Cinematic overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.15)_0%,transparent_60%),linear-gradient(to_bottom,rgba(2,2,2,0.2)_0%,rgba(2,2,2,0.8)_50%,rgba(0,0,0,1)_100%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-md px-8 pt-safe pb-safe flex flex-col min-h-screen">
        {/* Header */}
        <div className="mt-24 mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-electric-blue/90 mb-2 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
            ASCENT PERFORMANCE
          </p>
          <h1 className="font-montserrat text-4xl font-extrabold tracking-tight uppercase">
            MEMBER ACCESS
          </h1>
        </div>

        {/* Form Section */}
        <div className="flex-1 flex flex-col">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="group">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-text-dim group-focus-within:text-electric-blue transition-colors">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@performance.com"
                className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-3 text-sm focus:ring-0 focus:border-electric-blue transition-all duration-300 placeholder:text-white/10"
              />
            </div>

            {/* Password */}
            <div className="group relative">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-text-dim group-focus-within:text-electric-blue transition-colors">
                PASSWORD
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-3 text-sm focus:ring-0 focus:border-electric-blue transition-all duration-300 placeholder:text-white/10"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  className="text-[9px] font-bold tracking-[0.15em] text-white/30 hover:text-electric-blue uppercase transition-colors"
                >
                  FORGOT PASSWORD?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-black border border-electric-blue/50 text-white py-5 rounded-none transition-all duration-300 hover:bg-electric-blue/10 hover:border-electric-blue active:scale-[0.98] shadow-[0_0_30px_rgba(59,130,246,0.35)]"
              >
                <span className="font-bold text-xs uppercase tracking-[0.4em]">
                  ENTER PLATFORM
                </span>
              </button>
            </div>

            {/* Quick Access */}
            <div className="mt-12">
              <div className="relative flex items-center mb-8">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">
                  Quick Access
                </span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>
              <div className="flex justify-center gap-6">
                {/* Google */}
                <button
                  type="button"
                  className="w-12 h-12 flex items-center justify-center border border-white/10 bg-black/40 backdrop-blur-md rounded-full hover:border-electric-blue/40 hover:bg-white/5 transition-all"
                >
                  <svg className="w-5 h-5 fill-white/40 group-hover:fill-white" viewBox="0 0 24 24">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"></path>
                  </svg>
                </button>
                {/* Apple */}
                <button
                  type="button"
                  className="w-12 h-12 flex items-center justify-center border border-white/10 bg-black/40 backdrop-blur-md rounded-full hover:border-electric-blue/40 hover:bg-white/5 transition-all"
                >
                  <svg className="w-5 h-5 fill-white/40 group-hover:fill-white" viewBox="0 0 24 24">
                    <path d="M17.05,20.28c-0.96,0.95-2.05,1.72-3.38,1.72-1.33,0-2.25-0.77-3.38-1.72-2.11-1.78-2.11-1.78-4.22,0-1.13,0.95-2.22,1.72-3.55,1.72-1.33,0-2.42-0.77-3.38-1.72-1.92-1.92-1.92-5.02,0-6.94,1.92-1.92,5.02-1.92,6.94,0,0,0,0,0,0,0l0.55,0.55,0.55-0.55c1.92-1.92,5.02-1.92,6.94,0l0,0C18.97,15.26,18.97,18.36,17.05,20.28z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-auto py-10 text-center">
          <p className="text-text-dim text-[10px] font-semibold tracking-[0.1em] uppercase">
            NEW HERE?
            <Link href="/signup" className="text-white hover:text-electric-blue transition-colors ml-1 underline decoration-electric-blue/30 underline-offset-4">
              Create Account
            </Link>
          </p>
        </div>
      </main>

      {/* Mobile indicator */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 h-1 w-32 bg-white/10 rounded-full lg:hidden"></div>
    </div>
  );
}
