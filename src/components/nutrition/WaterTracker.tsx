"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WaterTrackerProps {
  currentMl: number;
  goalMl: number;
  onAddWater: (amount: number) => Promise<void> | void;
}

export default function WaterTracker({ currentMl, goalMl, onAddWater }: WaterTrackerProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const percentage = Math.min(100, (currentMl / goalMl) * 100);

  const presets = [
    { amount: 250, label: "Glass", icon: "local_drink" },
    { amount: 500, label: "Bottle", icon: "water_bottle" },
  ];

  const executeAddWater = async (amount: number) => {
    setIsAdding(true);
    try {
      await onAddWater(amount);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCustomAdd = () => {
    const val = parseInt(customAmount);
    if (!isNaN(val) && val > 0) {
      executeAddWater(val);
      setCustomAmount("");
    }
  };

  return (
    <div className="bg-surface-dark border border-white/5 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center h-full">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
        <span className="material-symbols-outlined text-[12rem] absolute -bottom-8 -right-8 rotate-12">
          water_drop
        </span>
      </div>

      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-dim mb-6">Hydration Matrix</h3>

      <div className="relative w-36 h-36 mb-6">
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
          </motion.div>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isAdding ? (
               <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
               <>
                 <span className="text-2xl font-display font-bold text-white tracking-tighter">
                   {currentMl}
                 </span>
                 <span className="text-[8px] font-black text-text-dim uppercase tracking-widest mt-1">
                   / {goalMl} ML
                 </span>
               </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <div className="flex gap-2 w-full">
          {presets.map((preset) => (
            <button
              key={preset.amount}
              disabled={isAdding}
              onClick={() => executeAddWater(preset.amount)}
              className="flex-1 bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/10 p-3 rounded-2xl transition-all group flex flex-col items-center"
            >
              <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform mb-1 text-sm">
                {preset.icon}
              </span>
              <p className="text-[9px] font-black uppercase tracking-widest text-white">
                +{preset.amount}
              </p>
            </button>
          ))}
        </div>

        <div className="relative w-full">
          <input 
            type="number" 
            placeholder="Custom ML"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs font-bold text-white placeholder:text-text-dim focus:outline-none focus:border-primary/50"
          />
          <button 
            onClick={handleCustomAdd}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>
      </div>

      <div className="mt-4 w-full flex justify-center">
          <p className="text-[7px] font-black text-primary uppercase tracking-[0.2em] italic">
             {percentage >= 100 ? "Fully Hydrated" : "Fueling Required"}
          </p>
      </div>
    </div>
  );
}
