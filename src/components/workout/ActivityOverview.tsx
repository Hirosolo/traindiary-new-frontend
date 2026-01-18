"use client";

import { useState } from "react";
import { CalendarLume } from "@/components/ui/calendar-lume";

interface ActivityOverviewProps {
  currentStreak: number;
  totalWorkouts: number;
  monthlyFocusLabel: string;
  monthlyFocusProgress: number;
  onLogWorkout: () => void;
  selectedMonth: number;
  selectedYear: number;
  onMonthYearChange: (year: number, month: number) => void;
}

export default function ActivityOverview({
  currentStreak,
  totalWorkouts,
  monthlyFocusLabel,
  monthlyFocusProgress,
  onLogWorkout,
  selectedMonth,
  selectedYear,
  onMonthYearChange,
}: ActivityOverviewProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarStep, setCalendarStep] = useState<"year" | "month">("year");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const handleCalendarClick = () => {
    setCalendarStep("year");
    setIsCalendarOpen(true);
  };

  const handleMonthYearChange = (year: number, month: number) => {
    onMonthYearChange(year, month);
    setIsCalendarOpen(false);
  };

  return (
    <aside className="w-72 border-r border-white/5 bg-surface-dark p-6 flex flex-col gap-8 shrink-0 overflow-y-auto">
      {/* Select Period Section */}
      <div className="relative">
        <button
          onClick={handleCalendarClick}
          className="w-full bg-surface-card border border-white/5 rounded-xl px-4 py-3 hover:border-white/10 transition-colors text-left"
        >
          <span className="text-[10px] uppercase tracking-[0.16em] text-text-dim font-bold block mb-1">
            Select Period
          </span>
          <p className="text-lg font-display font-bold text-white">
            {monthNames[selectedMonth]} {selectedYear}
          </p>
        </button>

        {isCalendarOpen && (
          <div className="absolute top-full left-0 mt-3 z-50 animate-in fade-in duration-200">
            <CalendarLume
              defaultMonth={selectedMonth}
              defaultYear={selectedYear}
              onMonthYearChange={handleMonthYearChange}
              initialStep={calendarStep}
              onClose={() => setIsCalendarOpen(false)}
            />
          </div>
        )}
      </div>
      <div>
        <h3 className="text-[10px] font-bold tracking-[0.2em] text-text-dim uppercase mb-4">
          Activity Overview
        </h3>
        <div className="space-y-4">
          <div className="bg-surface-card p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-primary mb-1">
              <span className="material-symbols-outlined text-sm">local_fire_department</span>
              <span className="text-xs font-bold uppercase tracking-wider">Current Streak</span>
            </div>
            <p className="text-3xl font-display font-bold">
              {currentStreak} <span className="text-sm text-text-dim font-normal">Days</span>
            </p>
          </div>
          <div className="bg-surface-card p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-white/50 mb-1">
              <span className="material-symbols-outlined text-sm">fitness_center</span>
              <span className="text-xs font-bold uppercase tracking-wider">Total Workouts</span>
            </div>
            <p className="text-3xl font-display font-bold">{totalWorkouts}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-bold tracking-[0.2em] text-text-dim uppercase mb-4">
          Monthly Focus
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-dim">{monthlyFocusLabel}</span>
            <span className="text-white font-medium">{monthlyFocusProgress}%</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${monthlyFocusProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5">
        <button
          onClick={onLogWorkout}
          className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>LOG WORKOUT</span>
        </button>
      </div>
    </aside>
  );
}
