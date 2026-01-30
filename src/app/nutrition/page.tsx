"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import NavBar from "@/components/ui/navbar";
import MacroOverview from "@/components/nutrition/MacroOverview";
import DailyMealList from "@/components/nutrition/DailyMealList";
import MealDetails from "@/components/nutrition/MealDetails";
import LogMealModal, { NewMealSession } from "@/components/nutrition/LogMealModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchMeals,
  createMeal,
  deleteMeal,
  fetchMealFoodItems,
  fetchMealNutritionTotals,
  fetchNutritionGoal,
  saveNutritionGoal,
  fetchMealDetails,
  ApiMeal,
} from "@/lib/api/nutrition";
import { fetchSummary } from "@/lib/api/workouts"; // Summary includes nutrition
import { motion, AnimatePresence } from "framer-motion";

/** Format serving: weight-based "100 g" + 1.5 → "150g"; else "1.5 piece", "1.5 slice", etc. */
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

const NUTRITION_LABELS: { key: string; label: string }[] = [
  { key: "total_calories", label: "Calories" },
  { key: "total_protein", label: "Protein" },
  { key: "total_carbs", label: "Carbs" },
  { key: "total_fat", label: "Fats" },
  { key: "total_fiber", label: "Fiber" },
  { key: "total_sugars", label: "Sugars" },
  { key: "total_zincs", label: "Zinc" },
  { key: "total_magnesiums", label: "Magnesium" },
  { key: "total_calciums", label: "Calcium" },
  { key: "total_irons", label: "Iron" },
  { key: "total_vitamin_a", label: "Vitamin A" },
  { key: "total_vitamin_c", label: "Vitamin C" },
  { key: "total_vitamin_b12", label: "Vitamin B12" },
  { key: "total_vitamin_d", label: "Vitamin D" },
];

function fmtNutrient(v: number | undefined, unit = "g"): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return v % 1 !== 0 ? `${v.toFixed(2)}${unit}` : `${Math.round(v)}${unit}`;
}

export default function NutritionPage() {
  const { user } = useAuth();
  const userId = user?.user_id ?? user?.id ?? 1;
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [meals, setMeals] = useState<any[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<any | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [macros, setMacros] = useState({
    calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, water: 2500
  });

  const [goals, setGoals] = useState({
    calories: 2800, protein: 220, carbs: 350, fats: 80, fiber: 40, water: 3500
  });

  const weekDays = useMemo(() => {
    const days = [];
    const start = new Date(selectedDate);
    start.setDate(selectedDate.getDate() - 3);
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(d);
    }
    return days;
  }, [selectedDate]);

  const loadDailyData = useCallback(async () => {
    setIsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // 1. Fetch Goals
      const goalResponse = await fetchNutritionGoal(dateStr);
      if (goalResponse) {
          setGoals({
              calories: goalResponse.calories_target,
              protein: goalResponse.protein_target_g,
              carbs: goalResponse.carbs_target_g,
              fats: goalResponse.fat_target_g,
              fiber: goalResponse.fiber_target_g,
              water: goalResponse.hydration_target_ml
          });
      }

      // 2. Fetch Meals
      const response = await fetchMeals(userId, dateStr);
      const mealsArray = Array.isArray(response) ? response : (response as any).data || [];
      
      const detailedMeals = mealsArray.map((m: any) => {
          // API returns total_* per meal (GET /meals)
          const hasTotals = m.total_calories != null || m.total_protein != null;
          const calories = hasTotals ? (m.total_calories ?? 0) : (m.details?.reduce((acc: number, d: any) => acc + (d.food?.calories_per_serving ?? 0) * (d.amount_grams ?? 1), 0) ?? 0);
          const protein = hasTotals ? (m.total_protein ?? 0) : (m.details?.reduce((acc: number, d: any) => acc + (d.food?.protein_per_serving ?? 0) * (d.amount_grams ?? 1), 0) ?? 0);
          const carbs = hasTotals ? (m.total_carbs ?? 0) : (m.details?.reduce((acc: number, d: any) => acc + (d.food?.carbs_per_serving ?? 0) * (d.amount_grams ?? 1), 0) ?? 0);
          const fats = hasTotals ? (m.total_fat ?? 0) : (m.details?.reduce((acc: number, d: any) => acc + (d.food?.fat_per_serving ?? 0) * (d.amount_grams ?? 1), 0) ?? 0);
          const fiber = hasTotals ? (m.total_fibers ?? 0) : (m.details?.reduce((acc: number, d: any) => acc + (d.food?.fiber ?? 0) * (d.amount_grams ?? 1), 0) ?? 0);

          const name = m.name || (m.meal_type ? String(m.meal_type).charAt(0).toUpperCase() + String(m.meal_type).slice(1) : "Meal");
          return {
              id: String(m.meal_id),
              meal_id: m.meal_id,
              name,
              mealType: m.meal_type || "Other",
              time: m.meal_time || "12:00",
              calories,
              protein,
              carbs,
              fats,
              fiber,
              foodItems: m.details?.map((d: any) => ({
                 id: String(d.meal_detail_id),
                 name: d.food?.name,
                 amount: `${d.amount_grams ?? d.numbers_of_serving ?? 1} servings`,
                 calories: (d.food?.calories_per_serving ?? 0) * (d.amount_grams ?? d.numbers_of_serving ?? 1)
              }))
          };
      });

      setMeals(detailedMeals);

      // 3. Set Aggregated Macros
      const dailyTotals = detailedMeals.reduce((acc: any, m: any) => ({
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein,
          carbs: acc.carbs + m.carbs,
          fats: acc.fats + m.fats,
          fiber: acc.fiber + m.fiber,
          water: acc.water
      }), { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, water: 0 });

      setMacros(dailyTotals);
    } catch (e) {
      console.error(e);
      setErrorMessage("Failed to synchronize nutrition data");
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedDate]);

  useEffect(() => {
    loadDailyData();
  }, [loadDailyData]);

  const handleMealClick = async (meal: any) => {
      setIsLoading(true);
      try {
          const data = await fetchMealDetails(meal.meal_id);
          if (data?.foods?.length) {
              // Map GET /meals/[id] data.foods[] into food items (all nutrition from API)
              const foodItems = data.foods.map((f) => ({
                  id: String(f.meal_detail_id),
                  meal_detail_id: f.meal_detail_id,
                  food_id: f.food_id,
                  name: f.food_name,
                  serving_type: f.serving_type,
                  image: f.image,
                  numbers_of_serving: f.numbers_of_serving,
                  total_calories: f.total_calories,
                  total_protein: f.total_protein,
                  total_carbs: f.total_carbs,
                  total_fat: f.total_fat,
                  total_fiber: f.total_fibers,
                  total_sugars: f.total_sugars,
                  total_zincs: f.total_zincs,
                  total_magnesiums: f.total_magnesiums,
                  total_calciums: f.total_calciums,
                  total_irons: f.total_irons,
                  total_vitamin_a: f.total_vitamin_a,
                  total_vitamin_c: f.total_vitamin_c,
                  total_vitamin_b12: f.total_vitamin_b12,
                  total_vitamin_d: f.total_vitamin_d,
              }));
              setSelectedMeal({ ...meal, foodItems });
          } else {
              const items = await fetchMealFoodItems(meal.meal_id);
              const detailed = {
                  ...meal,
                  foodItems: items.map((i: any) => ({
                      id: String(i.meal_detail_id),
                      name: i.name || "Food",
                      serving_type: i.serving_type,
                      amount_grams: i.amount_grams,
                      calories_per_serving: i.calories_per_serving,
                      protein_per_serving: i.protein_per_serving,
                      carbs_per_serving: i.carbs_per_serving,
                      fat_per_serving: i.fat_per_serving,
                      fiber: i.fiber,
                  })),
              };
              setSelectedMeal(detailed);
          }
      } catch (e) {
          setSelectedMeal(meal);
      } finally {
          setIsLoading(false);
      }
  };

  const handleCreateMeal = async (newMeal: NewMealSession) => {
      try {
          await createMeal({
              userId,
              mealDate: newMeal.date,
              mealTime: newMeal.time,
              mealType: newMeal.mealType,
              items: newMeal.items.map((i) => ({
                  food_id: i.food_id,
                  quantity: i.quantity ?? 1,
              })),
          });
          loadDailyData();
      } catch (e) {
          setErrorMessage("Failed to log meal session");
      }
  };

  return (
    <div className="bg-background-dark text-white min-h-screen font-body">
      <NavBar className="hidden lg:block shrink-0" />

      <main className="max-w-6xl mx-auto p-4 lg:p-8 pt-20 lg:pt-32 space-y-12 pb-32">
        {/* HEADER & DATE PICKER */}
        <section className="flex flex-col lg:flex-row justify-between items-center gap-8">
           <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-display font-bold uppercase italic tracking-tighter">Nutrition Terminal</h1>
              <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] mt-2">Precision Fueling System Enabled</p>
           </div>

           <div className="bg-surface-dark border border-white/5 p-2 rounded-3xl flex gap-2 overflow-x-auto no-scrollbar max-w-full">
              {weekDays.map((d, i) => {
                  const isSelected = d.toDateString() === selectedDate.toDateString();
                  return (
                      <button 
                        key={i} onClick={() => setSelectedDate(d)}
                        className={`flex flex-col items-center min-w-[60px] p-4 rounded-2xl transition-all ${isSelected ? 'bg-primary text-white scale-110 shadow-2xl' : 'text-text-dim hover:bg-white/5'}`}
                      >
                          <span className="text-[8px] font-black uppercase tracking-widest">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                          <span className="text-xl font-display font-bold mt-1">{d.getDate()}</span>
                      </button>
                  );
              })}
           </div>
        </section>

        {/* DAILY OVERVIEW */}
        <MacroOverview current={macros} goals={goals} />

        {/* MEAL LIST */}
        <DailyMealList 
          meals={meals} 
          onMealClick={handleMealClick} 
        />

        {/* LOG BUTTON (MOBILE ONLY) */}
        <div className="lg:hidden fixed bottom-8 right-8 z-40">
           <button 
             onClick={() => setIsLogModalOpen(true)}
             className="w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-95"
           >
              <span className="material-symbols-outlined text-3xl">add</span>
           </button>
        </div>

        {/* LOG BUTTON (DESKTOP) */}
        <div className="hidden lg:flex fixed bottom-12 left-1/2 -translate-x-1/2 z-40">
           <button 
             onClick={() => setIsLogModalOpen(true)}
             className="bg-white text-black px-12 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:bg-primary hover:text-white transition-all transform active:scale-95 flex items-center gap-3"
           >
              <span className="material-symbols-outlined">restaurant</span>
              <span>What you eat</span>
           </button>
        </div>
      </main>

      {/* MODALS */}
      <LogMealModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        onSubmit={handleCreateMeal} 
      />

      <AnimatePresence>
          {selectedMeal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-surface-dark border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl"
                >
                    <div className="p-8 border-b border-white/5 flex justify-between items-start">
                        <div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{selectedMeal.mealType}</span>
                            <h2 className="text-3xl font-display font-bold uppercase italic tracking-tighter text-white mt-1">{selectedMeal.name}</h2>
                        </div>
                        <button onClick={() => setSelectedMeal(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"><span className="material-symbols-outlined">close</span></button>
                    </div>
                    
                    <div className="p-8 space-y-6">
                        {(() => {
                            const items = selectedMeal.foodItems ?? [];
                            const hasApiTotals = items.some((i: any) => i.total_calories != null);
                            const mealTotals = hasApiTotals
                                ? items.reduce(
                                    (acc: any, i: any) => ({
                                        calories: (acc.calories ?? 0) + (i.total_calories ?? 0),
                                        protein: (acc.protein ?? 0) + (i.total_protein ?? 0),
                                        carbs: (acc.carbs ?? 0) + (i.total_carbs ?? 0),
                                        fat: (acc.fat ?? 0) + (i.total_fat ?? 0),
                                        fiber: (acc.fiber ?? 0) + (i.total_fiber ?? 0),
                                        sugars: (acc.sugars ?? 0) + (i.total_sugars ?? 0),
                                        zincs: (acc.zincs ?? 0) + (i.total_zincs ?? 0),
                                        magnesiums: (acc.magnesiums ?? 0) + (i.total_magnesiums ?? 0),
                                        calciums: (acc.calciums ?? 0) + (i.total_calciums ?? 0),
                                        irons: (acc.irons ?? 0) + (i.total_irons ?? 0),
                                        vitamin_a: (acc.vitamin_a ?? 0) + (i.total_vitamin_a ?? 0),
                                        vitamin_c: (acc.vitamin_c ?? 0) + (i.total_vitamin_c ?? 0),
                                        vitamin_b12: (acc.vitamin_b12 ?? 0) + (i.total_vitamin_b12 ?? 0),
                                        vitamin_d: (acc.vitamin_d ?? 0) + (i.total_vitamin_d ?? 0),
                                    }),
                                    {}
                                )
                                : null;
                            const cal = mealTotals?.calories ?? selectedMeal.calories;
                            const pro = mealTotals?.protein ?? selectedMeal.protein;
                            const carb = mealTotals?.carbs ?? selectedMeal.carbs;
                            const fat = mealTotals?.fat ?? selectedMeal.fats;
                            return (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-6 border-b border-white/5">
                                        <div className="text-center"><p className="text-xl font-display font-bold text-white">{Number.isFinite(cal) ? Math.round(cal) : 0}</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">KCAL</p></div>
                                        <div className="text-center"><p className="text-xl font-display font-bold text-blue-500">{Number.isFinite(pro) ? Math.round(pro) : 0}g</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">PRO</p></div>
                                        <div className="text-center"><p className="text-xl font-display font-bold text-red-500">{Number.isFinite(carb) ? Math.round(carb) : 0}g</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">CHO</p></div>
                                        <div className="text-center"><p className="text-xl font-display font-bold text-emerald-500">{Number.isFinite(fat) ? Math.round(fat) : 0}g</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">FAT</p></div>
                                        {mealTotals && (
                                            <>
                                                <div className="text-center"><p className="text-xl font-display font-bold text-white">{fmtNutrient(mealTotals.fiber)}</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">FIBER</p></div>
                                                <div className="text-center"><p className="text-xl font-display font-bold text-white">{fmtNutrient(mealTotals.sugars)}</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">SUGARS</p></div>
                                                <div className="text-center"><p className="text-lg font-display font-bold text-white">{fmtNutrient(mealTotals.zincs)}</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">ZINC</p></div>
                                                <div className="text-center"><p className="text-lg font-display font-bold text-white">{fmtNutrient(mealTotals.magnesiums)}</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">MAG</p></div>
                                                <div className="text-center"><p className="text-lg font-display font-bold text-white">{fmtNutrient(mealTotals.calciums)}</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">CALCIUM</p></div>
                                                <div className="text-center"><p className="text-lg font-display font-bold text-white">{fmtNutrient(mealTotals.irons)}</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">IRON</p></div>
                                                <div className="text-center"><p className="text-lg font-display font-bold text-white">{fmtNutrient(mealTotals.vitamin_a, "")}</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">VIT A</p></div>
                                                <div className="text-center"><p className="text-lg font-display font-bold text-white">{fmtNutrient(mealTotals.vitamin_c, "")}</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">VIT C</p></div>
                                                <div className="text-center"><p className="text-lg font-display font-bold text-white">{fmtNutrient(mealTotals.vitamin_b12, "")}</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">B12</p></div>
                                                <div className="text-center"><p className="text-lg font-display font-bold text-white">{fmtNutrient(mealTotals.vitamin_d, "")}</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">VIT D</p></div>
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 no-scrollbar">
                                        {items.map((i: any) => {
                                            const servingLabel = formatServingLabel(i.numbers_of_serving, i.serving_type) || i.amount || "—";
                                            return (
                                                <div key={i.id} className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="font-bold text-white uppercase italic tracking-tight">{i.name}</p>
                                                            <p className="text-[10px] text-text-dim uppercase mt-1">{servingLabel}</p>
                                                        </div>
                                                        <p className="text-xs font-black text-primary">{Number.isFinite(i.total_calories ?? i.calories) ? Math.round(i.total_calories ?? i.calories ?? 0) : 0} KCAL</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2 text-[10px] border-t border-white/5 pt-3">
                                                        {NUTRITION_LABELS.filter(({ key }) => key !== "total_calories").map(({ key, label }) => (
                                                            <div key={key} className="flex justify-between gap-2">
                                                                <span className="text-text-dim font-bold uppercase">{label}</span>
                                                                <span className="font-bold text-white">{fmtNutrient(i[key], key.includes("vitamin") || key.includes("zincs") || key.includes("magnesiums") || key.includes("calciums") || key.includes("irons") ? "" : "g")}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    <div className="p-8 pt-0 flex gap-4">
                        <button 
                            onClick={async () => {
                                await deleteMeal(selectedMeal.meal_id);
                                setSelectedMeal(null);
                                loadDailyData();
                            }}
                            className="flex-1 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all"
                        >
                            Deconstruct Meal
                        </button>
                        <button onClick={() => setSelectedMeal(null)} className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Return</button>
                    </div>
                </motion.div>
            </div>
          )}
      </AnimatePresence>

      <AnimatePresence>
          {errorMessage && (
              <motion.div 
                initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-widest"
              >
                  {errorMessage}
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
