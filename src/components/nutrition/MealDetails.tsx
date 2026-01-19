"use client";

import type { Meal } from "@/components/nutrition/MealCalendar";

interface MealDetailsProps {
  meal: Meal | null;
  onClose: () => void;
}

export default function MealDetails({
  meal,
  onClose,
}: MealDetailsProps) {
  if (!meal) return null;

  return (
    <aside className="w-full lg:w-[400px] border-l border-white/5 bg-surface-dark overflow-y-auto">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <h3 className="text-lg lg:text-xl font-display font-bold">Meal Details</h3>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            {meal.time && (
              <>
                <span className="text-primary font-bold text-xs uppercase tracking-widest">
                  {meal.time}
                </span>
                <span className="text-text-dim text-[10px] uppercase font-bold">•</span>
              </>
            )}
            {meal.icon && (
              <span className="material-symbols-outlined text-sm text-primary">{meal.icon}</span>
            )}
          </div>
          <h4 className="text-xl lg:text-2xl font-display font-bold">{meal.name}</h4>
        </div>

        <div className="space-y-6">
          {/* Macros Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-card p-4 rounded-2xl border border-white/5">
              <p className="text-[9px] font-bold text-text-dim uppercase mb-2">Protein</p>
              <p className="text-2xl font-display font-bold text-macro-protein">{meal.protein}g</p>
            </div>
            <div className="bg-surface-card p-4 rounded-2xl border border-white/5">
              <p className="text-[9px] font-bold text-text-dim uppercase mb-2">Carbs</p>
              <p className="text-2xl font-display font-bold text-macro-carbs">{meal.carbs}g</p>
            </div>
            <div className="bg-surface-card p-4 rounded-2xl border border-white/5">
              <p className="text-[9px] font-bold text-text-dim uppercase mb-2">Fats</p>
              <p className="text-2xl font-display font-bold text-macro-fats">{meal.fats}g</p>
            </div>
            <div className="bg-surface-card p-4 rounded-2xl border border-white/5">
              <p className="text-[9px] font-bold text-text-dim uppercase mb-2">Calories</p>
              <p className="text-2xl font-display font-bold text-orange-400">{meal.calories}</p>
            </div>
            <div className="bg-surface-card p-4 rounded-2xl border border-white/5">
              <p className="text-[9px] font-bold text-text-dim uppercase mb-2">Fiber</p>
              <p className="text-2xl font-display font-bold text-macro-fiber">{meal.fiber}g</p>
            </div>
          </div>

          {/* Ingredients */}
          {meal.items && meal.items.length > 0 && (
            <div className="bg-surface-card p-4 rounded-2xl border border-white/5">
              <h3 className="text-[10px] font-bold text-text-dim uppercase mb-3 tracking-wider">
                Ingredients
              </h3>
              <ul className="space-y-2">
                {meal.items.map((item, idx) => (
                  <li key={idx} className="text-sm text-white">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8">
          <button className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
            EDIT MEAL
          </button>
        </div>
      </div>
    </aside>
  );
}