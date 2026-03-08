"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WaterTrackerProps {
  currentMl: number;
  goalMl: number;
  onAddWater: (amount: number) => void;
}

export default function WaterTracker({ currentMl, goalMl, onAddWater }: WaterTrackerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const percentage = Math.min(100, (currentMl / goalMl) * 100);

  const presets = [
    { amount: 250, label: "Glass", icon: "local_drink" },
    { amount: 500, label: "Bottle", icon: "water_bottle" },
  ];

  return (
    <div className="bg-surface-dark border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
        <span className="material-symbols-outlined text-[15rem] absolute -bottom-10 -right-10 rotate-12">
          water_drop
        </span>
      </div>

      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-dim mb-8">Hydration Matrix</h3>

      <div className="relative w-48 h-48 mb-8">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-white/5" />
        
        {/* Progress Container */}
        <div className="absolute inset-2 rounded-full overflow-hidden bg-white/5">
          {/* Water Animation */}
          <motion.div 
            className="absolute bottom-0 left-0 w-full bg-primary/40"
            initial={{ height: 0 }}
            animate={{ height: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          >
            <div className="absolute top-0 left-0 w-full h-4 bg-primary/30 -translate-y-1/2 blur-sm" />
            
            {/* Wave effect */}
            <motion.div 
              className="absolute top-0 left-0 w-[200%] h-full opacity-30"
              animate={{ x: ["-50%", "0%"] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              style={{ background: "linear-gradient(90deg, transparent, white, transparent)" }}
            />
          </motion.div>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-display font-bold text-white tracking-tighter">
              {currentMl}
            </span>
            <span className="text-[8px] font-black text-text-dim uppercase tracking-widest mt-1">
              / {goalMl} ML
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 w-full">
        {presets.map((preset) => (
          <button
            key={preset.amount}
            onClick={() => onAddWater(preset.amount)}
            className="flex-1 bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/10 p-4 rounded-2xl transition-all group"
          >
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform mb-2">
              {preset.icon}
            </span>
            <p className="text-[10px] font-black uppercase tracking-widest text-white">
              +{preset.amount}ml
            </p>
            <p className="text-[8px] font-bold text-text-dim uppercase">
              {preset.label}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-6 w-full flex justify-center">
          <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] italic">
             {percentage >= 100 ? "System Optimized: Fully Hydrated" : "Fueling Required: Increase Fluid Intake"}
          </p>
      </div>
    </div>
  );
}
