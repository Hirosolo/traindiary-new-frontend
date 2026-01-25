"use client";

import { useState } from "react";
import type { FoodItem } from "@/lib/api/nutrition";
import type { Meal } from "@/components/nutrition/MealCalendar";

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

          {/* Food Items from Meal Details */}
          {meal.foodItems && meal.foodItems.length > 0 && (
            <div className="bg-surface-card p-4 rounded-2xl border border-white/5">
              <h3 className="text-[10px] font-bold text-text-dim uppercase mb-4 tracking-wider">
                Food Items
              </h3>
              <div className="space-y-4">
                {meal.foodItems.map((food: FoodItem, idx: number) => {
                  // Calculate nutrition based on amount_grams and serving_type
                  const servingType = food.serving_type || "100g";
                  // Extract grams per serving from serving_type (e.g., "100g" -> 100)
                  let gramsPerServing = 100;
                  if (servingType.endsWith("g") || servingType.endsWith("G")) {
                    const match = servingType.match(/^(\d+(?:\.\d+)?)\s*g$/i);
                    if (match) {
                      gramsPerServing = parseFloat(match[1]);
                    }
                  } else {
                    // For non-gram units, assume 1 serving = food.calories_per_serving
                    gramsPerServing = 1;
                  }
                  
                  // Calculate multiplier: amount_grams / grams_per_serving
                  const multiplier = (food.amount_grams || gramsPerServing) / gramsPerServing;
                  
                  const caloriesTotal = (food.calories_per_serving || 0) * multiplier;
                  const proteinTotal = (food.protein_per_serving || 0) * multiplier;
                  const carbsTotal = (food.carbs_per_serving || 0) * multiplier;
                  const fatsTotal = (food.fat_per_serving || 0) * multiplier;
                  const fiberTotal = (food.fiber || 0) * multiplier;

                  return (
                    <div key={idx} className="pb-4 border-b border-white/5 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-white">{food.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-primary/20 text-primary shrink-0">
                          {Math.round(food.amount_grams || gramsPerServing)}
                          {servingType.match(/\d/) ? (servingType.replace(/^\d+\.?\d*\s*/, "")) : servingType}
                        </span>
                      </div>
                      <p className="text-[9px] text-text-dim mb-3">{servingType} per serving</p>
                      <div className="grid grid-cols-4 gap-2 text-[9px]">
                        <div>
                          <p className="text-text-dim font-bold uppercase mb-1">P</p>
                          <p className="font-bold text-macro-protein">{Math.round(proteinTotal)}g</p>
                        </div>
                        <div>
                          <p className="text-text-dim font-bold uppercase mb-1">C</p>
                          <p className="font-bold text-macro-carbs">{Math.round(carbsTotal)}g</p>
                        </div>
                        <div>
                          <p className="text-text-dim font-bold uppercase mb-1">F</p>
                          <p className="font-bold text-macro-fats">{Math.round(fatsTotal)}g</p>
                        </div>
                        <div>
                          <p className="text-text-dim font-bold uppercase mb-1">Cal</p>
                          <p className="font-bold text-orange-400">{Math.round(caloriesTotal)}</p>
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