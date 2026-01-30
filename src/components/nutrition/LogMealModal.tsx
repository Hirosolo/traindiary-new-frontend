"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchMealTypes, fetchFoods } from "@/lib/api/nutrition";

export interface NewMealSession {
  mealType: string;
  date: string;
  time: string;
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  calories: number;
  items: Array<{
    name: string;
    quantity?: number;
    unit?: string;
    food_id?: number;
    grams_per_serving?: number;
  }>;
  notes?: string;
}

interface Food {
  id: string | number;
  name: string;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  calories?: number;
  servingSize?: string;
  grams_per_serving?: number;
}

interface SelectedFood extends Food {
  servings: number;
  displayAmount: number; // calculated: servings * grams_per_serving
}

interface LogMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (meal: NewMealSession) => Promise<void> | void;
}

const MEAL_TYPE_ICONS: Record<string, string> = {
  "Breakfast": "light_mode",
  "Lunch": "lunch_dining",
  "Dinner": "dinner_dining",
  "Snacks": "cookie",
  "Other": "restaurant",
};

export default function LogMealModal({ isOpen, onClose, onSubmit }: LogMealModalProps) {
  const [step, setStep] = useState(1);
  const [mealType, setMealType] = useState("Breakfast");
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [isLoadingFoods, setIsLoadingFoods] = useState(false);
  const [mealTypes, setMealTypes] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const loadData = async () => {
      try {
        const [types, foods] = await Promise.all([fetchMealTypes(), fetchFoods()]);
        setMealTypes(types.length > 0 ? types : ["Breakfast", "Lunch", "Dinner", "Snacks"]);
        setAvailableFoods(foods);
      } catch (e) {
        setMealTypes(["Breakfast", "Lunch", "Dinner", "Snacks"]);
      }
    };
    loadData();
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.length > 1) {
       setIsLoadingFoods(true);
       fetchFoods(searchQuery).then(foods => {
           setAvailableFoods(foods);
           setIsLoadingFoods(false);
       });
    }
  }, [searchQuery]);

  const filteredFoods = useMemo(() => {
    return availableFoods.filter(f => !selectedFoods.some(sf => sf.id === f.id));
  }, [availableFoods, selectedFoods]);

  const totals = useMemo(() => {
    return selectedFoods.reduce((acc, f) => {
        const mult = f.servings;
        return {
            calories: acc.calories + (f.calories ?? 0) * mult,
            protein: acc.protein + (f.protein ?? 0) * mult,
            carbs: acc.carbs + (f.carbs ?? 0) * mult,
            fats: acc.fats + (f.fats ?? 0) * mult,
            fiber: acc.fiber + (f.fiber ?? 0) * mult,
        };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });
  }, [selectedFoods]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleAddFood = (food: Food) => {
    setSelectedFoods([...selectedFoods, { ...food, servings: 1, displayAmount: food.grams_per_serving ?? 100 }]);
  };

  const handleRemoveFood = (id: string | number) => {
    setSelectedFoods(selectedFoods.filter(f => f.id !== id));
  };

  const updateServings = (id: string | number, val: number) => {
    setSelectedFoods(selectedFoods.map(f => {
        if (f.id === id) {
            const grams = f.grams_per_serving ?? 100;
            return { ...f, servings: val, displayAmount: val * grams };
        }
        return f;
    }));
  };

  const handleFinalSubmit = () => {
      const now = new Date();
      onSubmit({
          mealType,
          date: now.toISOString().split('T')[0],
          time: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          name: selectedFoods.length > 1 ? `${selectedFoods[0].name} +${selectedFoods.length-1}` : selectedFoods[0].name,
          ...totals,
          items: selectedFoods.map(f => ({
              name: f.name,
              food_id: Number(f.id),
              quantity: f.servings,
              grams_per_serving: f.grams_per_serving
          })),
          notes
      });
      onClose();
      setStep(1);
      setSelectedFoods([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-end lg:items-center justify-center p-0 lg:p-10">
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        className="bg-surface-dark w-full lg:max-w-4xl h-full lg:h-auto lg:max-h-[90vh] lg:rounded-[3rem] border-t lg:border border-white/10 flex flex-col overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-white/5">
           <motion.div 
             className="h-full bg-primary"
             animate={{ width: `${(step / 4) * 100}%` }}
           />
        </div>

        <div className="p-8 lg:p-12 flex flex-col h-full overflow-y-auto">
          <header className="flex justify-between items-start mb-10">
            <div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Step 0{step} of 04</span>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-white uppercase italic tracking-tighter mt-1">
                {step === 1 && "Initialization"}
                {step === 2 && "Database Search"}
                {step === 3 && "Performance Ratio"}
                {step === 4 && "Final Review"}
              </h2>
            </div>
            <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          <AnimatePresence mode="wait">
            <motion.div 
              key={step} 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              {step === 1 && (
                <div className="space-y-10">
                   <div>
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-widest block mb-4">Select Target Meal</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {mealTypes.map(t => (
                            <button 
                                key={t} onClick={() => setMealType(t)}
                                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${mealType === t ? 'border-primary bg-primary/10 text-white' : 'border-white/5 bg-surface-card text-text-dim'}`}
                            >
                                <span className="material-symbols-outlined text-3xl">{MEAL_TYPE_ICONS[t] || "restaurant"}</span>
                                <span className="text-xs font-black uppercase">{t}</span>
                            </button>
                        ))}
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-widest block mb-4">Performance Notes</label>
                      <textarea 
                        value={notes} onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add details about session timing or fueling feel..."
                        className="w-full h-32 bg-surface-card border border-white/5 rounded-3xl p-6 text-white focus:border-primary outline-none transition-all"
                      />
                   </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                   <div className="relative">
                      <input 
                        autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SEARCH CORE NUTRITION DB..."
                        className="w-full bg-surface-card border-2 border-white/5 rounded-[2.5rem] py-6 px-10 text-xl font-display font-bold uppercase italic tracking-tight outline-none focus:border-primary transition-all"
                      />
                      <span className="material-symbols-outlined absolute right-8 top-1/2 -translate-y-1/2 text-text-dim">search</span>
                   </div>

                   <div className="grid gap-3 max-h-[40vh] overflow-y-auto no-scrollbar">
                      {isLoadingFoods ? (
                          <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
                      ) : filteredFoods.map(f => (
                          <button 
                            key={f.id} onClick={() => handleAddFood(f)}
                            className="bg-surface-card/50 border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all"
                          >
                             <div className="text-left">
                                <p className="text-lg font-display font-bold text-white uppercase italic tracking-tighter">{f.name}</p>
                                <p className="text-[10px] font-bold text-text-dim uppercase mt-1">{f.calories} KCAL per {f.grams_per_serving ?? 100}G</p>
                             </div>
                             <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">add_circle</span>
                          </button>
                      ))}
                   </div>

                   {selectedFoods.length > 0 && (
                      <div className="pt-6 border-t border-white/5">
                         <p className="text-[10px] font-black text-text-dim uppercase tracking-widest mb-4">Staged Items ({selectedFoods.length})</p>
                         <div className="flex flex-wrap gap-3">
                            {selectedFoods.map(f => (
                                <span key={f.id} className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-black px-4 py-2 rounded-full flex items-center gap-2">
                                    {f.name}
                                    <button onClick={() => handleRemoveFood(f.id)}><span className="material-symbols-outlined text-sm">close</span></button>
                                </span>
                            ))}
                         </div>
                      </div>
                   )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                   {selectedFoods.map(f => (
                       <div key={f.id} className="bg-surface-card border border-white/5 p-8 rounded-[2rem] flex flex-col sm:flex-row items-center gap-8">
                          <div className="flex-1 text-center sm:text-left">
                             <h4 className="text-2xl font-display font-bold uppercase italic tracking-tighter text-white">{f.name}</h4>
                             <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mt-2">Displaying: {f.displayAmount}G (BASE: {f.grams_per_serving ?? 100}G)</p>
                          </div>
                          <div className="flex items-center gap-6">
                             <div className="flex items-center gap-3">
                                <button onClick={() => updateServings(f.id, Math.max(0.5, f.servings - 0.5))} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined">remove</span></button>
                                <input 
                                    type="number" value={f.servings} onChange={(e) => updateServings(f.id, parseFloat(e.target.value))}
                                    className="w-16 bg-transparent text-center text-2xl font-display font-bold text-primary"
                                />
                                <button onClick={() => updateServings(f.id, f.servings + 0.5)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined">add</span></button>
                             </div>
                             <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">Servings</span>
                          </div>
                       </div>
                   ))}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-10">
                   <div className="bg-primary/5 border border-primary/20 p-10 rounded-[3rem] text-center">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] block mb-6">Aggregate Nutrition</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                           <div><p className="text-4xl font-display font-bold tracking-tighter">{Math.round(totals.calories)}</p><p className="text-[10px] font-black text-text-dim uppercase mt-1">Calories</p></div>
                           <div><p className="text-4xl font-display font-bold tracking-tighter text-blue-500">{Math.round(totals.protein)}G</p><p className="text-[10px] font-black text-text-dim uppercase mt-1">Protein</p></div>
                           <div><p className="text-4xl font-display font-bold tracking-tighter text-red-500">{Math.round(totals.carbs)}G</p><p className="text-[10px] font-black text-text-dim uppercase mt-1">Carbs</p></div>
                           <div><p className="text-4xl font-display font-bold tracking-tighter text-emerald-500">{Math.round(totals.fats)}G</p><p className="text-[10px] font-black text-text-dim uppercase mt-1">Fats</p></div>
                        </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Summary for {mealType}</p>
                      {selectedFoods.map(f => (
                          <div key={f.id} className="flex justify-between items-center px-4 py-3 border-b border-white/5">
                             <span className="font-bold uppercase tracking-tight">{f.name}</span>
                             <span className="text-[10px] font-black text-text-dim">{f.servings} SERVINGS • {f.displayAmount}G</span>
                          </div>
                      ))}
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <footer className="mt-auto pt-12 flex gap-4">
            {step > 1 && (
                <button onClick={handleBack} className="flex-1 py-5 border border-white/5 rounded-[2rem] text-xs font-black uppercase tracking-widest text-text-dim hover:bg-white/5 transition-all">Previous Phase</button>
            )}
            {step < 4 ? (
                <button 
                  onClick={handleNext} disabled={step === 2 && selectedFoods.length === 0}
                  className="flex-[2] py-5 bg-white text-black rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                >
                    Iterate Next →
                </button>
            ) : (
                <button 
                  onClick={handleFinalSubmit}
                  className="flex-[2] py-5 bg-primary text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all"
                >
                    Finalise Data Entry
                </button>
            )}
          </footer>
        </div>
      </motion.div>
    </div>
  );
}
