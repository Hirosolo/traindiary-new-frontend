"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface MacroData {
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  calories: number;
  water: number;
}

interface MacroOverviewProps {
  current: MacroData;
  goals: MacroData;
}

export default function MacroOverview({ current, goals }: MacroOverviewProps) {
  const pieData = [
    { name: "Protein", value: current.protein * 4, color: "#3b82f6" },
    { name: "Carbs", value: current.carbs * 4, color: "#ef4444" },
    { name: "Fats", value: current.fats * 9, color: "#10b981" },
  ];

  const ProgressBar = ({ label, current, goal, color, unit }: any) => {
    const progress = Math.min(100, (current / goal) * 100);
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">{label}</span>
          <span className="text-xs font-black">
            {Math.round(current)}<span className="text-text-dim text-[10px]">/{goal}{unit}</span>
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-1000 ease-out rounded-full" 
            style={{ width: `${progress}%`, backgroundColor: color }} 
          />
        </div>
      </div>
    );
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 bg-surface-dark border border-white/5 p-6 lg:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
         <span className="material-symbols-outlined text-[10rem]">restaurant</span>
      </div>

      {/* Macro Circle */}
      <div className="flex flex-col items-center justify-center">
        <div className="h-64 w-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={105}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-black text-text-dim uppercase tracking-[0.2em]">Calories</span>
            <h2 className="text-5xl font-display font-bold tracking-tighter">{Math.round(current.calories)}</h2>
            <span className="text-[10px] font-bold text-text-dim uppercase mt-1">Goal: {goals.calories}</span>
          </div>
        </div>
        
        <div className="flex gap-6 mt-6">
           {pieData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                 <span className="text-[10px] font-black uppercase text-text-dim">{item.name}</span>
              </div>
           ))}
        </div>
      </div>

      {/* Linear Progress Bars */}
      <div className="lg:col-span-2 grid sm:grid-cols-2 gap-x-12 gap-y-8 py-4">
         <ProgressBar label="Protein" current={current.protein} goal={goals.protein} color="#3b82f6" unit="g" />
         <ProgressBar label="Carbohydrates" current={current.carbs} goal={goals.carbs} color="#ef4444" unit="g" />
         <ProgressBar label="Total Fats" current={current.fats} goal={goals.fats} color="#10b981" unit="g" />
         <ProgressBar label="Dietary Fiber" current={current.fiber} goal={goals.fiber} color="#f59e0b" unit="g" />
         <ProgressBar label="Hydration" current={current.water} goal={goals.water} color="#06b6d4" unit="ml" />
         <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-center border border-dashed border-white/10">
            <span className="text-[10px] font-black uppercase text-white/20 tracking-widest italic">Performance Fueling Optimized</span>
         </div>
      </div>
    </div>
  );
}
