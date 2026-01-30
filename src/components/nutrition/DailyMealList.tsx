"use client";

import { motion, AnimatePresence } from "framer-motion";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  amount: string;
}

interface Meal {
  id: string;
  meal_id?: number;
  name: string;
  mealType: string;
  time?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  items?: FoodItem[];
}

interface DailyMealListProps {
  meals: Meal[];
  onMealClick: (meal: Meal) => void;
}

const MEAL_TYPES_ORDER = ["Breakfast", "Lunch", "Dinner", "Snacks", "Supplements", "Other"];

export default function DailyMealList({ meals, onMealClick }: DailyMealListProps) {
  const grouped = MEAL_TYPES_ORDER.reduce((acc, type) => {
    const typeMeals = meals.filter(m => m.mealType.toLowerCase() === type.toLowerCase());
    if (typeMeals.length > 0) {
      acc[type] = typeMeals;
    }
    return acc;
  }, {} as Record<string, Meal[]>);

  // Add any meals that don't match the standard types
  const otherMeals = meals.filter(m => !MEAL_TYPES_ORDER.some(t => t.toLowerCase() === m.mealType.toLowerCase()));
  if (otherMeals.length > 0) grouped["Other"] = [...(grouped["Other"] || []), ...otherMeals];

  return (
    <div className="space-y-12 pb-20">
      {Object.entries(grouped).map(([type, typeMeals]) => (
        <section key={type} className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary">{type}</h3>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {typeMeals.map((meal, idx) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onMealClick(meal)}
                className="bg-surface-card border border-white/5 rounded-3xl p-6 hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <span className="material-symbols-outlined text-4xl">local_dining</span>
                </div>

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">{meal.time || "LOGGED"}</span>
                    <h4 className="text-xl font-display font-bold uppercase italic tracking-tight text-white mt-1">{meal.name}</h4>
                  </div>
                  <div className="bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                    <span className="text-xs font-black text-primary uppercase">{Math.round(meal.calories)} KCAL</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-white/5 pt-4">
                  <div className="text-center">
                    <p className="text-[8px] font-black text-text-dim uppercase mb-1">Protein</p>
                    <p className="text-sm font-black text-white">{Math.round(meal.protein)}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-black text-text-dim uppercase mb-1">Carbs</p>
                    <p className="text-sm font-black text-white">{Math.round(meal.carbs)}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-black text-text-dim uppercase mb-1">Fats</p>
                    <p className="text-sm font-black text-white">{Math.round(meal.fats)}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-black text-text-dim uppercase mb-1">Fiber</p>
                    <p className="text-sm font-black text-white">{Math.round(meal.fiber ?? 0)}g</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      ))}

      {meals.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-6xl text-white/5 mb-4">no_meals</span>
          <h3 className="text-xl font-display font-bold text-white uppercase italic tracking-tighter">No Fuel Logged Today</h3>
          <p className="text-xs text-text-dim uppercase tracking-widest mt-2">Initialize performance tracking to view metrics</p>
        </div>
      )}
    </div>
  );
}
