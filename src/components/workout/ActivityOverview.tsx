"use client";

interface ActivityOverviewProps {
  currentStreak: number;
  totalWorkouts: number;
  monthlyFocusLabel: string;
  monthlyFocusProgress: number;
  onLogWorkout: () => void;
  selectedMonth?: number;
  selectedYear?: number;
  onMonthYearChange?: (year: number, month: number) => void;
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
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const handlePrev = () => {
    if (onMonthYearChange && selectedMonth !== undefined && selectedYear !== undefined) {
      const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
      const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
      onMonthYearChange(newYear, newMonth);
    }
  };

  const handleNext = () => {
    if (onMonthYearChange && selectedMonth !== undefined && selectedYear !== undefined) {
      const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
      const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
      onMonthYearChange(newYear, newMonth);
    }
  };

  return (
    <aside className="w-72 border-r border-white/5 bg-surface-dark p-6 flex flex-col gap-8 shrink-0 overflow-y-auto">
      {onMonthYearChange && selectedMonth !== undefined && selectedYear !== undefined ? (
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-text-dim uppercase">Period</p>
            <p className="text-lg font-display font-bold leading-tight">
              {monthNames[selectedMonth]} {selectedYear}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="size-9 rounded-full border border-white/10 text-white/80 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center"
              aria-label="Previous month"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <button
              onClick={handleNext}
              className="size-9 rounded-full border border-white/10 text-white/80 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center"
              aria-label="Next month"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      ) : null}

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