"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, Salad, BarChart3, User, Settings } from "lucide-react";

const navItems = [
  { href: "/", icon: <Home size={22} />, label: "Home" },
  { href: "/workout", icon: <Dumbbell size={22} />, label: "Workout" },
  { href: "/nutrition", icon: <Salad size={22} />, label: "Nutrition" },
  { href: "/summary", icon: <BarChart3 size={22} />, label: "Summary" },
  { href: "/programs", icon: <Settings size={22} />, label: "Program" },
  { href: "/profile", icon: <User size={22} />, label: "Profile" },
];

const FloatingNav = () => {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Sync active tab with current route; prefer the longest matching prefix and treat home as exact
  useEffect(() => {
    if (!pathname) return;

    const matchIndex = navItems.reduce((bestIndex, item, index) => {
      if (item.href === "/") {
        return pathname === "/" ? index : bestIndex;
      }

      if (pathname.startsWith(item.href)) {
        const currentBest = navItems[bestIndex];
        const currentLength = currentBest?.href?.length ?? -1;
        return item.href.length > currentLength ? index : bestIndex;
      }
      return bestIndex;
    }, 0);

    setActiveIndex(matchIndex);
  }, [pathname]);

  // Update indicator position when active changes or resize
  useEffect(() => {
    const updateIndicator = () => {
      if (btnRefs.current[activeIndex] && containerRef.current) {
        const btn = btnRefs.current[activeIndex];
        const container = containerRef.current;
        if (!btn) return;
        const btnRect = btn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setIndicatorStyle({
          width: btnRect.width,
          left: btnRect.left - containerRect.left,
        });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeIndex]);

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 px-3 lg:hidden">
      <div
        ref={containerRef}
        className="relative flex items-center justify-between rounded-full border border-surface-highlight bg-surface-card/90 px-1 py-2 shadow-xl backdrop-blur"
      >
        {navItems.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            ref={(el) => (btnRefs.current[index] = el)}
            onClick={() => setActiveIndex(index)}
            aria-current={activeIndex === index ? "page" : undefined}
            className={`relative flex flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors hover:text-white ${
              activeIndex === index ? "text-white" : "text-text-dim"
            }`}
          >
            <div className="z-10">{item.icon}</div>
            <span className="hidden text-[10px] uppercase tracking-[0.1em] sm:block">{item.label}</span>
          </Link>
        ))}

        <motion.div
          animate={indicatorStyle}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-primary/15"
        />
      </div>
    </div>
  );
};

export default FloatingNav;
