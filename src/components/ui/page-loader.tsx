"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  minimumVisibleMs?: number;
  fadeDurationMs?: number;
  className?: string;
}

// Shows a full-screen loader on initial load and briefly after each route change.
// Because Next.js App Router doesn't expose route-change start events, this fires
// once the new route is ready to render, then fades out after a short delay.
const PageLoader = ({
  minimumVisibleMs = 500,
  fadeDurationMs = 350,
  className,
}: PageLoaderProps) => {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    clearTimers();
    setVisible(true);

    timers.current.push(
      window.setTimeout(() => {
        setVisible(false);
      }, minimumVisibleMs),
    );

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, minimumVisibleMs]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={cn(
            "fixed inset-0 z-[120] bg-background-dark/90 backdrop-blur-sm flex items-center justify-center",
            className,
          )}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fadeDurationMs / 1000, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center gap-4">
            <Loader variant="spin" size="lg" intent="primary" aria-label="Loading page" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold">
              Loading
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { PageLoader };