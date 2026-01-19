"use client";

import { useState } from "react";
import Image from "next/image";
import { BlurText } from "@/components/ui/blur-text";
import { TextEffect } from "@/components/core/text-effect";
import { TextLoop } from "@/components/core/text-loop";
import ClickSpark from "@/components/ui/click-spark";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedFixedNavbar from "@/components/ui/navbar";
import {
  ScrollProgress,
  FadeInOnScroll,
  Parallax,
  ScaleOnScroll,
  RevealOnScroll,
  StaggerOnScroll,
  BlurInOnScroll,
} from "@/components/ui/scroll-animation";

export default function LandingPage() {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleWelcomeComplete = () => {
    // Wait a bit after animation completes before transitioning
    setTimeout(() => {
      setShowWelcome(false);
    }, 800);
  };

  return (
    <ClickSpark
      sparkColor="#3b82f6"
      sparkSize={12}
      sparkRadius={20}
      sparkCount={10}
      duration={500}
      easing="ease-out"
      extraScale={1.2}
    >
      {/* Scroll Progress Indicator */}
      <ScrollProgress color="#3b82f6" height={3} position="top" />

      {/* Navigation (Old nav with animation, fixed) */}
      <AnimatedFixedNavbar />

      {/* Mobile menu handled by AnimatedFixedNavbar */}

      {/* Hero Section */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-end md:items-center pt-20">
        <div className="container max-w-[1440px] mx-auto px-6 md:px-8 relative z-10 pb-16 md:pb-0">
          <div className="max-w-3xl">
            <FadeInOnScroll direction="up" delay={0.2} distance={20}>
              <p className="text-primary font-bold tracking-[0.3em] md:tracking-[0.5em] uppercase text-[10px] md:text-xs mb-4 md:mb-6">
                Built for the dedicated
              </p>
            </FadeInOnScroll>
            <h1 className="fluid-heading font-bold font-display leading-[0.9] tracking-tighter uppercase mb-4 md:mb-0">
              <TextEffect per="char" preset="blur" delay={0.5} className="block">
                Welcome to
              </TextEffect>
              <TextEffect per="char" preset="blur" delay={1.2} className="text-outline block">
                Train Diary
              </TextEffect>
            </h1>
            <FadeInOnScroll direction="up" delay={0.4} distance={20}>
              <p className="mt-4 md:mt-8 text-base md:text-lg text-text-dim max-w-lg font-light leading-relaxed">
                <TextLoop interval={4000}>
                  <span>Engineering physical perfection through data-driven performance tracking.</span>
                  <span>Track your workouts with precision and achieve elite-level results.</span>
                  <span>Transform your training with intelligent analytics and insights.</span>
                  <span>Your personal fitness companion for peak performance.</span>
                </TextLoop>
              </p>
            </FadeInOnScroll>
            <FadeInOnScroll direction="up" delay={0.6} distance={20}>
              <div className="mt-8 md:mt-12 flex">
                <button className="group w-full md:w-auto flex items-center justify-between md:justify-start gap-4 border border-white px-8 md:px-10 py-4 md:py-5 hover:bg-white hover:text-black transition-all">
                  <span className="text-xs md:text-sm font-bold uppercase tracking-architectural"><a href="/signin">Start Training</a></span>
                  <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform text-2xl md:text-base">
                    arrow_right_alt
                  </span>
                </button>
              </div>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Precision Section */}
        <section className="py-16 md:py-32 border-b border-white/5 bg-background-dark/80 backdrop-blur-sm">
          <div className="max-w-[1440px] mx-auto px-6 md:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="relative group order-2 lg:order-1">
                <ScaleOnScroll startScale={0.95} endScale={1}>
                  <div className="absolute -inset-2 md:-inset-4 border border-white/10 group-hover:border-primary/30 transition-colors"></div>
                  <Parallax speed={0.15}>
                    <Image
                      alt="Tracking Interface"
                      className="relative w-full aspect-[4/5] object-cover grayscale brightness-75"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzUa0TgPMrtwpmf9XhMJz5TLxZA7qi719mtFlcl8yq7mGIJksTiYxLDT4802DFGe6rcYfHOVumhLVrF6A7Tcb35sXvWBUOJOWeO76ykALDaqy-DZRLLAirGB6PacTWX6e5Ojsw_B1Cj6bg9N8JI5m-SYXPuaVN24oL4UYjsytx6RyWxwHCuvdIk5Cq_nNfNF0IGcivx55cpbif_gbdmBQ6BteuTXhxCODAWYgOywNQlAFMeHyhW3XKEYOUwcT40mOz76EgTbTqlFA"
                      width={800}
                      height={1000}
                    />
                  </Parallax>
                  <FadeInOnScroll direction="left" delay={0.2} distance={30}>
                    <div className="absolute bottom-6 -right-4 md:bottom-10 md:-right-10 bg-primary px-6 py-6 md:px-8 md:py-8">
                      <p className="text-3xl md:text-5xl font-bold font-display">98.4%</p>
                      <p className="text-[8px] md:text-[10px] uppercase font-bold tracking-widest mt-1">Accuracy Rate</p>
                    </div>
                  </FadeInOnScroll>
                </ScaleOnScroll>
              </div>
              <div className="order-1 lg:order-2">
                <FadeInOnScroll direction="up" delay={0.1} distance={20}>
                  <span className="text-primary text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em]">
                    01. Precision
                  </span>
                </FadeInOnScroll>
                <BlurInOnScroll delay={0.2}>
                  <h2 className="text-3xl md:text-5xl font-bold font-display uppercase mt-3 md:mt-4 mb-6 md:mb-8 tracking-tight">
                    Unrivaled Tracking
                  </h2>
                </BlurInOnScroll>
                <FadeInOnScroll direction="up" delay={0.3}>
                  <p className="text-text-dim text-left md:text-justify leading-relaxed text-base md:text-lg font-light max-w-xl">
                    Leave nothing to chance. Our high-performance analytics engine captures every metric of your
                    progression—from volume distribution to peak force output.
                  </p>
                </FadeInOnScroll>
                <StaggerOnScroll staggerDelay={0.15} direction="up" className="mt-8 md:mt-12 space-y-4 md:space-y-6">
                  <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                    <span className="text-primary font-display font-bold text-lg md:text-xl">01</span>
                    <span className="text-[10px] md:text-sm uppercase font-bold tracking-widest">
                      Real-time Volume Analysis
                    </span>
                  </div>
                  <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                    <span className="text-primary font-display font-bold text-lg md:text-xl">02</span>
                    <span className="text-[10px] md:text-sm uppercase font-bold tracking-widest">Fatigue Monitoring</span>
                  </div>
                </StaggerOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* Nutrition Section */}
        <section className="py-16 md:py-32 bg-background-dark/80 backdrop-blur-sm">
          <div className="max-w-[1440px] mx-auto px-6 md:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="order-2 lg:order-1">
                <FadeInOnScroll direction="up" delay={0.1} distance={20}>
                  <span className="text-primary text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em]">
                    02. Fueling
                  </span>
                </FadeInOnScroll>
                <BlurInOnScroll delay={0.2}>
                  <h2 className="text-3xl md:text-5xl font-bold font-display uppercase mt-3 md:mt-4 mb-6 md:mb-8 tracking-tight">
                    Elite Nutrition
                  </h2>
                </BlurInOnScroll>
                <FadeInOnScroll direction="up" delay={0.3}>
                  <p className="text-text-dim text-left md:text-justify leading-relaxed text-base md:text-lg font-light max-w-xl">
                    Fuel your potential with algorithmic nutrition planning. Our system adapts your macronutrient ratios
                    based on daily exertion.
                  </p>
                </FadeInOnScroll>
                <FadeInOnScroll direction="up" delay={0.4} distance={20}>
                  <button className="mt-8 md:mt-12 group flex items-center gap-3 text-white">
                    <span className="text-xs md:text-sm font-bold uppercase tracking-widest border-b-2 border-primary pb-1">
                      View Meal Architect
                    </span>
                    <span className="material-symbols-outlined text-primary">trending_flat</span>
                  </button>
                </FadeInOnScroll>
              </div>
              <div className="relative order-1 lg:order-2">
                <ScaleOnScroll startScale={0.95} endScale={1}>
                  <div className="absolute inset-0 bg-primary/10 blur-[60px] md:blur-[100px] rounded-full"></div>
                  <RevealOnScroll direction="right">
                    <Image
                      alt="Nutrition"
                      className="relative w-full aspect-square object-cover grayscale brightness-90"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcD4xFYpUbquadhovPPXuyCAV8sMjZHPQKDe21SBuVMokejKj1onbUzv_j3vAfONRt8nCsbvY81Ru0Fcd-D5B2-II3Bos4DLbvBoEKeRyObHzevzc3WTWRNNIQlu-lCIYI-t6zvphJHPilX0Jy6NoiIVbkb9qWVp9itrGV4uea6npgHwPYGcTGEfibAsKvQYNBts3S--UX51wDTLyVrAl1cf5hQSfXnJoWuAEKdqVch94Mpzy7jNVkp3LEczFMJraLDf-IBz8GLMI"
                      width={800}
                      height={800}
                    />
                  </RevealOnScroll>
                </ScaleOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-40 bg-surface-dark/80 backdrop-blur-sm border-t border-white/5 text-center overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
            <Parallax speed={0.3}>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] lg:text-[30vw] font-bold text-white/[0.02] whitespace-nowrap font-display">
                TrainDiary
              </span>
            </Parallax>
          </div>
          <div className="container mx-auto px-6 md:px-8 relative z-10">
            <BlurInOnScroll>
              <h3 className="text-4xl md:text-7xl font-bold font-display uppercase mb-10 md:mb-12 tracking-tighter">
                Ready to Evolve?
              </h3>
            </BlurInOnScroll>
            <FadeInOnScroll direction="up" delay={0.2} distance={20}>
              <div className="flex flex-col items-center gap-6 md:gap-8">
                <button className="group w-full sm:w-auto relative bg-white text-black px-12 md:px-16 py-5 md:py-6 overflow-hidden transition-all hover:scale-105 active:scale-95">
                  <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative z-10 text-xs md:text-sm font-bold uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                    <a href="/signin">Join The Journey</a>
                    
                  </span>
                </button>
                <p className="text-text-dim text-[10px] md:text-xs uppercase tracking-widest font-bold">
                  LIMITED ENROLLMENT FOR Q4
                </p>
              </div>
            </FadeInOnScroll>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background-dark/90 backdrop-blur-sm py-12 md:py-20 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-start gap-10 md:gap-12">
          <FadeInOnScroll direction="up" delay={0.1}>
            <div className="w-full md:w-auto">
              <h4 className="text-lg md:text-xl font-bold font-display tracking-architectural mb-4 md:mb-6">TrainDiary</h4>
              <p className="text-text-dim text-xs md:text-sm max-w-xs leading-relaxed">
                The premier destination for high-performance aesthetics and athletic development.
              </p>
            </div>
          </FadeInOnScroll>
          <StaggerOnScroll staggerDelay={0.1} direction="up" className="grid grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16 w-full md:w-auto">
            <div className="flex flex-col gap-3 md:gap-4">
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-primary">Platform</span>
              <a className="text-xs md:text-sm text-text-dim hover:text-white transition-colors" href="#">
                Workouts
              </a>
              <a className="text-xs md:text-sm text-text-dim hover:text-white transition-colors" href="#">
                Nutrition
              </a>
              <a className="text-xs md:text-sm text-text-dim hover:text-white transition-colors" href="#">
                Coaching
              </a>
            </div>
            <div className="flex flex-col gap-3 md:gap-4">
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-primary">Company</span>
              <a className="text-xs md:text-sm text-text-dim hover:text-white transition-colors" href="#">
                Philosophy
              </a>
              <a className="text-xs md:text-sm text-text-dim hover:text-white transition-colors" href="#">
                The Lab
              </a>
            </div>
            <div className="flex flex-col gap-3 md:gap-4 col-span-2 lg:col-span-1">
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-primary">Social</span>
              <div className="flex flex-row lg:flex-col gap-6 lg:gap-4">
                <a className="text-xs md:text-sm text-text-dim hover:text-white transition-colors" href="#">
                  Instagram
                </a>
                <a className="text-xs md:text-sm text-text-dim hover:text-white transition-colors" href="#">
                  YouTube
                </a>
              </div>
            </div>
          </StaggerOnScroll>
        </div>
        <FadeInOnScroll direction="up" delay={0.3}>
          <div className="max-w-[1440px] mx-auto px-6 md:px-8 mt-12 md:mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between text-[9px] md:text-[10px] text-text-dim uppercase tracking-widest font-bold text-center md:text-left">
            <p>© 2024 TrainDiary PERFORMANCE SYSTEMS. ALL RIGHTS RESERVED.</p>
            <div className="flex justify-center md:justify-end gap-6 md:gap-8 mt-4 md:mt-0">
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="#">Security</a>
            </div>
          </div>
        </FadeInOnScroll>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background-dark/90 backdrop-blur-xl border-t border-white/10 px-6 py-3">
        <div className="flex justify-around items-center">
          <a className="flex flex-col items-center gap-1 text-primary" href="#">
            <span className="material-symbols-outlined text-2xl">home</span>
            <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
          </a>
          <a className="flex flex-col items-center gap-1 text-text-dim" href="#">
            <span className="material-symbols-outlined text-2xl">fitness_center</span>
            <span className="text-[9px] font-bold uppercase tracking-widest">Train</span>
          </a>
          <a className="flex flex-col items-center gap-1 text-text-dim" href="#">
            <span className="material-symbols-outlined text-2xl">restaurant</span>
            <span className="text-[9px] font-bold uppercase tracking-widest">Fuel</span>
          </a>
          <a className="flex flex-col items-center gap-1 text-text-dim" href="#">
            <span className="material-symbols-outlined text-2xl">person</span>
            <span className="text-[9px] font-bold uppercase tracking-widest">Profile</span>
          </a>
        </div>
      </div>

      {/* Spacer for mobile bottom nav */}
      <div className="h-16 lg:hidden"></div>
    </ClickSpark>
  );
}
