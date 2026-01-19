'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Forgot password request for:', email);
    // Trigger password recovery flow here
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center overflow-hidden bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img
          alt="Professional gym tricep rope attachment"
          className="w-full h-full object-cover object-[70%_center] brightness-[1.8] contrast-[1.4] saturate-[0.9] scale-110"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAllRzzgFtL68FX113ZyhGnIl8PWSuuFvwd3dUhvV7cmiOxlz88FR2KbAAMzZ05a8MgNCrtzFWQWeOkXnRzEEvAcsv72t3gIyPKkYQn4KUEv8lTFjyY15ldTxwy-z1Hkg0ppoE_drHsePXuPsH83ikoLCYgd8BX0W_sT-lgxpzJLzUD8pFwb9jduvLFhF5i7Ixt8kjDAw_rvrANrNUjNWRyfB8PLUNrHOA8h9fio2BS-HbLAlHpa7IZd_DWInEb6AuvmYDdWtTktro"
        />
        <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_0%_0%,rgba(59,130,246,0.25),transparent_75%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30"></div>
        <div className="absolute top-0 right-0 w-[80%] h-full bg-gradient-to-l from-electric-blue/20 via-transparent to-transparent opacity-40 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,255,255,0.12)_0%,transparent_40%),radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.15)_0%,transparent_50%),linear-gradient(to_bottom,rgba(0,0,0,0.1)_0%,rgba(2,2,2,0.7)_50%,rgba(0,0,0,1)_100%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
      </div>

      {/* Main content */}
      <main className="relative z-10 w-full max-w-md px-10 pt-safe pb-safe flex flex-col h-full text-center">
        {/* Top bar */}
        <div className="mt-6 flex justify-start items-center">
          <Link
            href="/"
            className="text-xl font-bold font-display tracking-architectural hover:text-electric-blue transition-colors"
          >
            TrainDiary
          </Link>
        </div>

        {/* Heading */}
        <div className="mt-12 mb-12 flex flex-col items-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-electric-blue drop-shadow-[0_0_10px_rgba(59,130,246,0.9)] mb-4">
            Ascent Security
          </p>
          <h1 className="font-montserrat text-4xl font-extrabold tracking-tight uppercase leading-[0.9] text-white">
            Password
            <br />
            Recovery
          </h1>
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col items-center w-full">
          <form className="space-y-10 w-full" onSubmit={handleSubmit}>
            <div className="group text-left">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim group-focus-within:text-electric-blue transition-colors">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-4 text-base focus:ring-0 focus:border-electric-blue transition-all duration-300 placeholder:text-white/10 text-center group-focus-within:!border-electric-blue"
              />
              <p className="mt-4 text-[11px] leading-relaxed text-white/40 font-medium text-center">
                Enter your email to receive a recovery link.
              </p>
            </div>
            <div className="pt-8">
              <button
                type="submit"
                className="w-full bg-electric-blue border border-electric-blue/50 text-white py-5 rounded-none transition-all duration-300 hover:brightness-110 active:scale-[0.98] shadow-[0_0_25px_rgba(59,130,246,0.5),inset_0_0_8px_rgba(255,255,255,0.2)]"
              >
                <span className="font-black text-xs uppercase tracking-[0.5em] text-white">
                  Send Reset Link
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-auto py-12 flex justify-center">
          <Link href="/signin" className="group inline-flex flex-col items-center">
            <span className="text-white/60 group-hover:text-white text-[10px] font-bold tracking-[0.2em] uppercase transition-colors">
              Back to Sign In
            </span>
            <div className="h-[1px] w-0 group-hover:w-full bg-electric-blue transition-all duration-300 mt-1"></div>
          </Link>
        </div>
      </main>

      {/* Mobile indicator */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 h-1 w-32 bg-white/20 rounded-full lg:hidden"></div>
    </div>
  );
}
