"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, useScroll, useMotionValueEvent } from "motion/react";

interface NavItem {
  name: string;
  link: string;
}

interface AnimatedFixedNavbarProps {
  brand?: string;
  items?: NavItem[];
  className?: string;
}

export default function NavBar({
  brand = "TrainDiary",
  items = [
    { name: "Home", link: "/" },
    { name: "Workout", link: "workout" },
    { name: "Nutrition", link: "nutrition" },
    { name: "Summary", link: "summary" },
    { name: "Programs", link: "programs" },
  ],
  className,
}: AnimatedFixedNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const [elevated, setElevated] = useState(false);
  const pathname = usePathname();

  const getHref = (link: string) => (link.startsWith("/") ? link : `/${link}`);
  const isActive = (link: string) => pathname === getHref(link);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setElevated(latest > 40);
  });

  return (
    <motion.nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b border-white/5",
        className,
      )}
      animate={{
        backdropFilter: elevated ? "blur(12px)" : "blur(4px)",
        boxShadow: elevated
          ? "0 0 24px rgba(34, 42, 53, 0.08), 0 1px 1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(34, 42, 53, 0.05)"
          : "none",
        backgroundColor: elevated
          ? "rgba(5,5,5,0.85)"
          : "rgba(5,5,5,0.60)",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 35 }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <a
            className="text-xl md:text-2xl font-bold font-display tracking-architectural"
            href="/"
          >
            {brand}
          </a>
          <div className="hidden lg:flex items-center gap-8">
            {items.map((item) => (
              <a
                key={item.name}
                className={cn(
                  "text-[11px] font-bold uppercase tracking-widest transition-colors pb-1",
                  isActive(item.link)
                    ? "text-white border-b-2 border-primary"
                    : "text-text-dim hover:text-white",
                )}
                href={getHref(item.link)}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <button className="material-symbols-outlined text-white/70 hover:text-white transition-colors">
            search
          </button>
          <button className="hidden sm:block bg-white text-black text-[11px] font-bold px-6 py-2 uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
            <a href="/signin">Join Now</a>
            
          </button>
          <button
            className="lg:hidden flex items-center cursor-pointer"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="material-symbols-outlined text-white">menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-background-dark transition-transform duration-300 lg:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-12">
            <span className="text-xl font-bold font-display tracking-architectural">
              {brand}
            </span>
            <button
              className="cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>
          <div className="flex flex-col gap-8">
            {items.map((item) => (
              <a
                key={`mobile-${item.name}`}
                className="text-3xl font-bold font-display uppercase tracking-tight border-b border-white/5 pb-4 text-text-dim hover:text-white transition-colors"
                href={getHref(item.link)}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="mt-auto pb-8">
            <button className="w-full bg-white text-black py-5 font-bold uppercase tracking-widest">
              Join The Movement
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
