"use client";

import { useState } from "react";
import { CalendarLume } from "@/components/ui/calendar-lume";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ActivityOverviewProps {
  currentStreak: number;
  grScore: number;
  grScoreChange?: number;
  muscleSplit: Array<{ name: string; value: number; color: string }>;
  onLogWorkout: () => void;
}

export default function ActivityOverview({
  currentStreak,
  grScore,
  grScoreChange = 0,
  muscleSplit,
  onLogWorkout,
}: ActivityOverviewProps) {
  return (
    <aside className="w-80 border-r border-white/5 bg-surface-dark p-6 flex flex-col gap-8 shrink-0 overflow-y-auto hidden lg:flex">

      <div className="space-y-6">
        <div>
          <h3 className="text-[10px] font-bold tracking-[0.2em] text-text-dim uppercase mb-4 px-1">
            Performance Core
          </h3>
          <div className="space-y-3">
            {/* Grinding Score (GR) */}
            <div className="bg-surface-card p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-4xl text-primary">bolt</span>
              </div>
              <div className="flex items-center gap-2 text-primary mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest">GR Score</span>
              </div>
              <p className="text-4xl font-display font-bold tracking-tighter">
                {grScore.toLocaleString()}
              </p>
              {grScoreChange !== 0 && (
                <div className="mt-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    grScoreChange > 0 ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {grScoreChange > 0 ? '+' : ''}{grScoreChange}% vs last month
                  </span>
                </div>
              )}
            </div>

            {/* Longest Streak */}
            <div className="bg-surface-card p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-4xl text-orange-500">local_fire_department</span>
              </div>
              <div className="flex items-center gap-2 text-orange-500 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest">Longest Streak</span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-display font-bold tracking-tighter">{currentStreak}</p>
                <span className="text-xs text-text-dim font-bold mb-1 uppercase tracking-wider">Days</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold tracking-[0.2em] text-text-dim uppercase mb-4 px-1">
            Muscle Split (Weekly)
          </h3>
          <div className="bg-surface-card p-5 rounded-2xl border border-white/5">
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={muscleSplit}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {muscleSplit.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Focus</span>
                <span className="text-lg font-display font-bold text-white uppercase italic">Elite</span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 gap-2">
              {muscleSplit.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5">
        <button
          onClick={onLogWorkout}
          className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all duration-300 transform active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          <span className="text-xs uppercase tracking-[0.1em]">CREATE SESSION</span>
        </button>
      </div>
    </aside>
  );
}