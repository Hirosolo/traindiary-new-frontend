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
          // New backend might include details directly
          const totals = m.details?.reduce((acc: any, d: any) => {
              const f = d.food;
              const mult = d.amount_grams;
              return {
                  calories: acc.calories + (f.calories_per_serving * mult),
                  protein: acc.protein + (f.protein_per_serving * mult),
                  carbs: acc.carbs + (f.carbs_per_serving * mult),
                  fats: acc.fats + (f.fat_per_serving * mult),
                  fiber: acc.fiber + (f.fibers_per_serving * mult),
              }
          }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }) || { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };

          return {
              id: String(m.meal_id),
              meal_id: m.meal_id,
              name: m.name || m.meal_type || "Meal",
              mealType: m.meal_type || "Other",
              time: m.meal_time || "12:00",
              calories: totals.calories ?? 0,
              protein: totals.protein ?? 0,
              carbs: totals.carbs ?? 0,
              fats: totals.fats ?? 0,
              fiber: totals.fiber ?? 0,
              foodItems: m.details?.map((d: any) => ({
                 id: String(d.meal_detail_id),
                 name: d.food?.name,
                 amount: `${d.amount_grams} servings`,
                 calories: d.food?.calories_per_serving * d.amount_grams
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
          const items = await fetchMealFoodItems(meal.meal_id);
          const detailed = { 
              ...meal, 
              foodItems: items.map((i: any) => ({
                id: String(i.meal_detail_id),
                name: i.foods?.name || "Food",
                calories: i.calories_per_serving, // verify field names
                protein: i.protein_per_serving,
                carbs: i.carbs_per_serving,
                fats: i.fat_per_serving,
                amount: `${i.amount_grams}g`
              }))
          };
          setSelectedMeal(detailed);
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
              items: newMeal.items.map(i => ({ food_id: i.food_id, amount_grams: (i.quantity ?? 1) * (i.grams_per_serving ?? 100) }))
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
                        <div className="grid grid-cols-4 gap-4 pb-6 border-b border-white/5">
                            <div className="text-center"><p className="text-2xl font-display font-bold text-white">{Math.round(selectedMeal.calories)}</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">KCAL</p></div>
                            <div className="text-center"><p className="text-2xl font-display font-bold text-blue-500">{Math.round(selectedMeal.protein)}G</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">PRO</p></div>
                            <div className="text-center"><p className="text-2xl font-display font-bold text-red-500">{Math.round(selectedMeal.carbs)}G</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">CHO</p></div>
                            <div className="text-center"><p className="text-2xl font-display font-bold text-emerald-500">{Math.round(selectedMeal.fats)}G</p><p className="text-[8px] font-black text-text-dim uppercase mt-1">FAT</p></div>
                        </div>

                        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
                            {selectedMeal.foodItems?.map((i: any) => (
                                <div key={i.id} className="bg-white/5 p-5 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-white uppercase italic tracking-tight">{i.name}</p>
                                        <p className="text-[10px] text-text-dim uppercase mt-1">{i.amount}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-primary">{Math.round(i.calories)} KCAL</p>
                                    </div>
                                </div>
                            ))}
                        </div>
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
