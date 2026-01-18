"use client";

interface ActivityOverviewProps {
  currentStreak: number;
  totalWorkouts: number;
  monthlyFocusLabel: string;
  monthlyFocusProgress: number;
  onLogWorkout: () => void;
}

export default function ActivityOverview({
  currentStreak,
  totalWorkouts,
  monthlyFocusLabel,
  monthlyFocusProgress,
  onLogWorkout,
}: ActivityOverviewProps) {
  return (
    <aside className="w-72 border-r border-white/5 bg-surface-dark p-6 flex flex-col gap-8 shrink-0 overflow-y-auto">
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
