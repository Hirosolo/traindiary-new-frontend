"use client";

import { useState } from "react";
import type { FoodItem } from "@/lib/api/nutrition";
import type { Meal } from "@/components/nutrition/MealCalendar";

/** Weight-based "100 g" + 1.5 → "150g"; else "1.5 piece", "1.5 slice", etc. */
function formatServingLabel(numbersOfServing: number | undefined, servingType: string | undefined): string {
  if (numbersOfServing == null) return servingType ?? "—";
  const n = Number(numbersOfServing);
  if (!servingType?.trim()) return "—";
  const st = servingType.trim();
  const weightMatch = st.match(/^(\d+(?:\.\d+)?)\s*g\s*$/i) || st.match(/^(\d+(?:\.\d+)?)\s*g$/i);
  if (weightMatch) {
    const gramsPerServing = parseFloat(weightMatch[1]);
    const totalG = n * gramsPerServing;
    return `${Math.round(totalG) === totalG ? totalG : totalG.toFixed(1)}g`;
  }
  return `${n} ${st}`;
}

/** Food item with either API totals (total_*) or per-serving values for display */
type MealFoodItem = FoodItem | (FoodItem & {
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  total_fiber?: number;
  numbers_of_serving?: number;
  total_sugars?: number;
  total_zincs?: number;
  total_magnesiums?: number;
  total_calciums?: number;
  total_irons?: number;
  total_vitamin_a?: number;
  total_vitamin_c?: number;
  total_vitamin_b12?: number;
  total_vitamin_d?: number;
});

interface MealDetailsProps {
  meal: Meal | null;
  onClose: () => void;
  onDelete?: (mealId: string) => Promise<void>;
  onUpdate?: (updates: Partial<Meal>) => Promise<void>;
  isSaving?: boolean;
}

export default function MealDetails({
  meal,
  onClose,
  onDelete,
  onUpdate,
  isSaving = false,
}: MealDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(meal?.name || "");
  const [editedTime, setEditedTime] = useState(meal?.time || "");
  const [editedProtein, setEditedProtein] = useState(meal?.protein || 0);
  const [editedCarbs, setEditedCarbs] = useState(meal?.carbs || 0);
  const [editedFats, setEditedFats] = useState(meal?.fats || 0);
  const [editedCalories, setEditedCalories] = useState(meal?.calories || 0);

  if (!meal) return null;

  const handleSave = async () => {
    if (onUpdate) {
      await onUpdate({
        name: editedName,
        time: editedTime,
        protein: editedProtein,
        carbs: editedCarbs,
        fats: editedFats,
        calories: editedCalories,
      });
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete && confirm("Are you sure you want to delete this meal?")) {
      await onDelete(meal.id);
    }
  };

  if (isEditing) {
    return (
      <aside className="w-full lg:w-[400px] border-l border-white/5 bg-surface-dark overflow-y-auto">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h3 className="text-lg lg:text-xl font-display font-bold">Edit Meal</h3>
            <button
              onClick={() => setIsEditing(false)}
              className="text-text-dim hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-dim mb-2 uppercase">
                Meal Name
              </label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full px-3 py-2 bg-surface-card border border-white/5 rounded-lg focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-dim mb-2 uppercase">
                Time
              </label>
              <input
                type="time"
                value={editedTime}
                onChange={(e) => setEditedTime(e.target.value)}
                className="w-full px-3 py-2 bg-surface-card border border-white/5 rounded-lg focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-text-dim mb-2 uppercase">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={editedProtein}
                  onChange={(e) => setEditedProtein(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-surface-card border border-white/5 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-dim mb-2 uppercase">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={editedCarbs}
                  onChange={(e) => setEditedCarbs(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-surface-card border border-white/5 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-dim mb-2 uppercase">
                  Fats (g)
                </label>
                <input
                  type="number"
                  value={editedFats}
                  onChange={(e) => setEditedFats(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-surface-card border border-white/5 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-dim mb-2 uppercase">
                  Calories
                </label>
                <input
                  type="number"
                  value={editedCalories}
                  onChange={(e) => setEditedCalories(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-surface-card border border-white/5 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSaving ? "SAVING..." : "SAVE CHANGES"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="w-full bg-surface-card text-white font-bold py-3 rounded-lg border border-white/5 hover:bg-surface-highlight transition-all"
            >
              CANCEL
            </button>
          </div>
        </div>
      </aside>
    );
  }

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
            {meal.mealType && (
              <span className="text-text-dim text-xs uppercase font-bold">
                {meal.mealType}
              </span>
            )}
          </div>
          <h4 className="text-xl lg:text-2xl font-display font-bold">{meal.name}</h4>
        </div>

        <div className="space-y-6">
          {/* Macros Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-card p-4 rounded-2xl border border-white/5">
              <p className="text-[9px] font-bold text-text-dim uppercase mb-2">Protein</p>
              <p className="text-2xl font-display font-bold text-macro-protein">
                {meal.protein}g
              </p>
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
              <p className="text-2xl font-display font-bold text-orange-400">
                {meal.calories}
              </p>
            </div>
            <div className="bg-surface-card p-4 rounded-2xl border border-white/5">
              <p className="text-[9px] font-bold text-text-dim uppercase mb-2">Fiber</p>
              <p className="text-2xl font-display font-bold text-macro-fiber">{meal.fiber}g</p>
            </div>
          </div>

          {/* Food Items from Meal Details (GET /meals/[id] foods with nutrition) */}
          {meal.foodItems && meal.foodItems.length > 0 && (
            <div className="bg-surface-card p-4 rounded-2xl border border-white/5">
              <h3 className="text-[10px] font-bold text-text-dim uppercase mb-4 tracking-wider">
                Foods in this meal
              </h3>
              <div className="space-y-4">
                {(meal.foodItems as MealFoodItem[]).map((food, idx) => {
                  const hasTotals = "total_calories" in food && food.total_calories != null;
                  const mult = (() => {
                    if (hasTotals) return 1;
                    const st = food.serving_type || "100g";
                    let g = 100;
                    const m = st.match(/^(\d+(?:\.\d+)?)\s*g$/i);
                    if (m) g = parseFloat(m[1]);
                    return (food.amount_grams ?? g) / g;
                  })();
                  const calories = hasTotals ? (food.total_calories ?? 0) : (food.calories_per_serving ?? 0) * mult;
                  const protein = hasTotals ? (food.total_protein ?? 0) : (food.protein_per_serving ?? 0) * mult;
                  const carbs = hasTotals ? (food.total_carbs ?? 0) : (food.carbs_per_serving ?? 0) * mult;
                  const fats = hasTotals ? (food.total_fat ?? 0) : (food.fat_per_serving ?? 0) * mult;
                  const fiber = hasTotals ? (food.total_fiber ?? 0) : (food.fiber ?? 0) * mult;
                  const sugars = hasTotals ? (food.total_sugars ?? 0) : undefined;
                  const zinc = hasTotals ? (food.total_zincs ?? 0) : undefined;
                  const magnesium = hasTotals ? (food.total_magnesiums ?? 0) : undefined;
                  const calcium = hasTotals ? (food.total_calciums ?? 0) : undefined;
                  const iron = hasTotals ? (food.total_irons ?? 0) : undefined;
                  const vitA = hasTotals ? (food.total_vitamin_a ?? 0) : undefined;
                  const vitC = hasTotals ? (food.total_vitamin_c ?? 0) : undefined;
                  const vitB12 = hasTotals ? (food.total_vitamin_b12 ?? 0) : undefined;
                  const vitD = hasTotals ? (food.total_vitamin_d ?? 0) : undefined;

                  const servingLabel = "numbers_of_serving" in food && food.serving_type
                    ? formatServingLabel(food.numbers_of_serving, food.serving_type)
                    : food.serving_type
                      ? `${food.amount_grams ?? "—"}g (${food.serving_type})`
                      : `${food.amount_grams ?? "—"}g`;

                  const fmt = (v: number | undefined, unit = "g") =>
                    v != null ? `${typeof v === "number" && v % 1 !== 0 ? v.toFixed(2) : Math.round(v)}${unit}` : "—";

                  const nutritionRows: { label: string; value: string }[] = [
                    { label: "Calories", value: fmt(calories, "") },
                    { label: "Protein", value: fmt(protein) },
                    { label: "Carbs", value: fmt(carbs) },
                    { label: "Fats", value: fmt(fats) },
                    { label: "Fiber", value: fmt(fiber) },
                    { label: "Sugars", value: fmt(sugars) },
                    { label: "Zinc", value: fmt(zinc) },
                    { label: "Magnesium", value: fmt(magnesium) },
                    { label: "Calcium", value: fmt(calcium) },
                    { label: "Iron", value: fmt(iron) },
                    { label: "Vitamin A", value: fmt(vitA) },
                    { label: "Vitamin C", value: fmt(vitC) },
                    { label: "Vitamin B12", value: fmt(vitB12) },
                    { label: "Vitamin D", value: fmt(vitD) },
                  ];

                  return (
                    <div key={food.meal_detail_id ?? food.food_id ?? idx} className="pb-4 border-b border-white/5 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-white">{food.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-primary/20 text-primary shrink-0">
                          {servingLabel}
                        </span>
                      </div>
                      <div className="mt-3 pl-0 border-l-2 border-primary/30 bg-white/[0.02] rounded-r-xl py-3 px-4">
                        <p className="text-[9px] font-black text-text-dim uppercase tracking-widest mb-3">
                          Nutrition facts
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-2 text-[10px]">
                          {nutritionRows.map(({ label, value }) => (
                            <div key={label} className="flex justify-between gap-2 sm:block">
                              <p className="text-text-dim font-bold uppercase mb-0.5">{label}</p>
                              <p className="font-bold text-white">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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

        <div className="mt-8 space-y-3">
          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
          >
            EDIT MEAL
          </button>
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={isSaving}
              className="w-full bg-red-500/10 text-red-400 font-bold py-4 rounded-2xl border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSaving ? "DELETING..." : "DELETE MEAL"}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}