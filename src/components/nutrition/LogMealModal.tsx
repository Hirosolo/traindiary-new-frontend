"use client";

import { useEffect, useMemo, useState } from "react";
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
  servingAmount: number;
  servingUnit: string;
  grams_per_serving: number;
  baseNutrients: {
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    calories: number;
  };
}

interface FoodPopupData {
  food: Food | null;
  servingAmount: number;
  servingUnit: string;
}

interface LogMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (meal: NewMealSession) => Promise<void> | void;
}

const FALLBACK_FOODS: Food[] = [
  {
    id: "fallback-f1",
    name: "Chicken Breast",
    protein: 31,
    carbs: 0,
    fats: 3,
    fiber: 0,
    calories: 165,
    servingSize: "100g",
  },
  {
    id: "fallback-f2",
    name: "Brown Rice",
    protein: 3,
    carbs: 23,
    fats: 1,
    fiber: 2,
    calories: 111,
    servingSize: "100g",
  },
  {
    id: "fallback-f3",
    name: "Broccoli",
    protein: 3,
    carbs: 7,
    fats: 0,
    fiber: 2,
    calories: 34,
    servingSize: "100g",
  },
  {
    id: "fallback-f4",
    name: "Eggs",
    protein: 13,
    carbs: 1,
    fats: 11,
    fiber: 0,
    calories: 155,
    servingSize: "100g",
  },
  {
    id: "fallback-f5",
    name: "Salmon",
    protein: 25,
    carbs: 0,
    fats: 13,
    fiber: 0,
    calories: 206,
    servingSize: "100g",
  },
];

const MEAL_TYPE_ICONS: Record<string, string> = {
  "Breakfast": "light_mode",
  "Lunch": "lunch_dining",
  "Dinner": "dinner_dining",
  "Snack": "cookie",
  "Pre-Workout": "directions_run",
  "Post-Workout": "fitness_center",
};

const extractServingUnit = (servingSize: string | undefined): string => {
  if (!servingSize) return "serving";
  const match = servingSize.match(/[a-zA-Z]+/);
  return match ? match[0] : "serving";
};

const extractServingAmount = (servingSize: string | undefined): number => {
  if (!servingSize) return 1;
  const match = servingSize.match(/\d+\.?\d*/);
  return match ? parseFloat(match[0]) : 1;
};

export default function LogMealModal({
  isOpen,
  onClose,
  onSubmit,
}: LogMealModalProps) {
  const [step, setStep] = useState(1);
  const formatLocalDate = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const [date, setDate] = useState(formatLocalDate());
  const formatNowTime = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };
  const [time, setTime] = useState(formatNowTime());
  const [mealType, setMealType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [availableFoods, setAvailableFoods] = useState<Food[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [mealTypes, setMealTypes] = useState<string[]>([]);
  const [isLoadingFoods, setIsLoadingFoods] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Food popup state
  const [foodPopup, setFoodPopup] = useState<FoodPopupData>({
    food: null,
    servingAmount: 1,
    servingUnit: "",
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!isOpen) return;

    // When opening, set current date/time so the user does not have to pick
    setDate(formatLocalDate());
    setTime(formatNowTime());

    const loadFoods = async () => {
      setIsLoadingFoods(true);
      setLoadError(null);
      try {
        const foods = await fetchFoods(debouncedSearchQuery || undefined);
        const normalizedQuery = debouncedSearchQuery.trim().toLowerCase();
        const filteredFoods = normalizedQuery
          ? foods.filter((f) => f.name.toLowerCase().includes(normalizedQuery))
          : foods;

        // Use filtered results; only fallback when not searching
        if (normalizedQuery && filteredFoods.length === 0) {
          // Actively searching with no matches
          setAvailableFoods([]);
        } else if (filteredFoods.length > 0) {
          setAvailableFoods(filteredFoods);
        } else if (!normalizedQuery) {
          setAvailableFoods(FALLBACK_FOODS);
        } else {
          setAvailableFoods([]);
        }
      } catch (error) {
        console.warn("Failed to fetch foods, using fallback", error);
        // Only use fallback when there's an error and no search query
        if (!debouncedSearchQuery || debouncedSearchQuery.trim() === "") {
          setAvailableFoods(FALLBACK_FOODS);
        } else {
          setAvailableFoods([]);
        }
        setLoadError(error instanceof Error ? error.message : "Failed to load foods");
      } finally {
        setIsLoadingFoods(false);
      }
    };

    const loadTypes = async () => {
      setIsLoadingTypes(true);
      try {
        const types = await fetchMealTypes();
        setMealTypes(types);
        if (types.length > 0 && !mealType) {
          setMealType(types[0]);
        }
      } catch (error) {
        console.warn("Failed to fetch meal types, using defaults", error);
        const defaults = ["Breakfast", "Lunch", "Dinner", "Snack"];
        setMealTypes(defaults);
        setMealType(defaults[0]);
      } finally {
        setIsLoadingTypes(false);
      }
    };

    if (step === 2) {
      loadFoods();
    }

    if (step === 1) {
      loadTypes();
    }
  }, [isOpen, step, debouncedSearchQuery, mealType]);

  // Reset all state when modal closes so data is not kept after closing
  useEffect(() => {
    if (isOpen) return;
    setStep(1);
    setDate(formatLocalDate());
    setTime(formatNowTime());
    setMealType(mealTypes[0] || "Breakfast");
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setSelectedFoods([]);
    setFoodPopup({ food: null, servingAmount: 1, servingUnit: "" });
    setLoadError(null);
  }, [isOpen, mealTypes]);

  const selectedFoodIds = useMemo(() => new Set(selectedFoods.map((f) => String(f.id))), [selectedFoods]);
  const availableFoodsFiltered = useMemo(
    () => availableFoods.filter((f) => !selectedFoodIds.has(String(f.id))),
    [availableFoods, selectedFoodIds]
  );

  const handleOpenFoodPopup = (food: Food) => {
    setFoodPopup({
      food,
      servingAmount: 1, // Start with 1 serving
      servingUnit: extractServingUnit(food.servingSize),
    });
  };

  const handleAddFoodFromPopup = () => {
    if (!foodPopup.food) return;

    const gramsPerServing = foodPopup.food.grams_per_serving ?? extractServingAmount(foodPopup.food.servingSize);
    // servingAmount is now the number of servings (e.g., 1, 2, 3)
    // Nutrients are already per serving, so just multiply by servingAmount
    const multiplier = foodPopup.servingAmount;

    const newFood: SelectedFood = {
      ...foodPopup.food,
      servingAmount: foodPopup.servingAmount,
      servingUnit: foodPopup.servingUnit,
      grams_per_serving: gramsPerServing,
      baseNutrients: {
        protein: (foodPopup.food.protein ?? 0) * multiplier,
        carbs: (foodPopup.food.carbs ?? 0) * multiplier,
        fats: (foodPopup.food.fats ?? 0) * multiplier,
        fiber: (foodPopup.food.fiber ?? 0) * multiplier,
        calories: (foodPopup.food.calories ?? 0) * multiplier,
      },
    };

    setSelectedFoods([...selectedFoods, newFood]);
    setFoodPopup({ food: null, servingAmount: 1, servingUnit: "" });
  };

  const handleRemoveFood = (foodId: string | number) => {
    setSelectedFoods(selectedFoods.filter((f) => f.id !== foodId));
  };

  const handleUpdateFoodServing = (
    foodId: string | number,
    servingAmount: number
  ) => {
    setSelectedFoods(
      selectedFoods.map((f) => {
        if (f.id === foodId) {
          // servingAmount is now the number of servings (e.g., 1, 2, 3)
          // Nutrients are already per serving, so just multiply by servingAmount
          const multiplier = servingAmount;

          return {
            ...f,
            servingAmount,
            baseNutrients: {
              protein: (f.protein ?? 0) * multiplier,
              carbs: (f.carbs ?? 0) * multiplier,
              fats: (f.fats ?? 0) * multiplier,
              fiber: (f.fiber ?? 0) * multiplier,
              calories: (f.calories ?? 0) * multiplier,
            },
          };
        }
        return f;
      })
    );
  };

  const calculateTotals = useMemo(() => {
    return selectedFoods.reduce(
      (acc, food) => ({
        protein: acc.protein + food.baseNutrients.protein,
        carbs: acc.carbs + food.baseNutrients.carbs,
        fats: acc.fats + food.baseNutrients.fats,
        fiber: acc.fiber + food.baseNutrients.fiber,
        calories: acc.calories + food.baseNutrients.calories,
      }),
      { protein: 0, carbs: 0, fats: 0, fiber: 0, calories: 0 }
    );
  }, [selectedFoods]);

  const handleSubmit = async () => {
    if (!mealType || selectedFoods.length === 0) {
      setLoadError("Please select meal type and at least one food");
      return;
    }

    setIsSubmitting(true);
    try {
      const mealName = selectedFoods.map((f) => f.name).join(", ");

      const newMeal: NewMealSession = {
        mealType,
        date,
        time,
        name: mealName,
        protein: Math.round(calculateTotals.protein),
        carbs: Math.round(calculateTotals.carbs),
        fats: Math.round(calculateTotals.fats),
        fiber: Math.round(calculateTotals.fiber),
        calories: Math.round(calculateTotals.calories),
        items: selectedFoods.map((f) => ({
          name: f.name,
          quantity: f.servingAmount, // Number of servings
          unit: f.servingUnit,
          food_id: typeof f.id === 'number' ? f.id : parseInt(String(f.id)),
          grams_per_serving: f.grams_per_serving, // Pass grams per serving for API calculation
        })),
        notes: "",
      };

      await onSubmit(newMeal);

      // Reset form
      setStep(1);
      setDate(new Date().toISOString().split("T")[0]);
      setTime("12:00");
      setMealType(mealTypes[0] || "Breakfast");
      setSearchQuery("");
      setDebouncedSearchQuery("");
      setSelectedFoods([]);
      setLoadError(null);
      onClose();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to save meal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-50">
      <div className="bg-surface-dark w-full lg:max-w-2xl lg:rounded-3xl rounded-t-3xl h-[95vh] lg:h-[95vh] max-h-[95vh] lg:max-h-[95vh] border border-white/10 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 bg-surface-dark border-b border-white/5 p-6 flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-display font-bold">Log Meal</h2>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col space-y-6">
          {/* Step 1: Meal Type, Date & Time */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-bold text-text-dim mb-3 uppercase tracking-wider">
                  Meal Type
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {mealTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setMealType(type)}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        mealType === type
                          ? "border-primary bg-primary/10"
                          : "border-white/5 bg-surface-card hover:border-primary/50"
                      }`}
                    >
                      <span className="material-symbols-outlined block mx-auto mb-2 text-2xl">
                        {MEAL_TYPE_ICONS[type] || "restaurant"}
                      </span>
                      <p className="text-xs font-bold">{type}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-text-dim mb-3 uppercase tracking-wider">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-card border border-white/5 rounded-lg focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-dim mb-3 uppercase tracking-wider">
                    Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-card border border-white/5 rounded-lg focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Footer will render NEXT button */}
            </>
          )}

          {/* Step 2: Food Selection */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: available foods */}
                <div>
                  <div className="sticky top-0 z-10 -mx-6 -mt-6 px-6 pt-6 bg-surface-dark pb-3 border-b border-white/5 lg:-mx-0 lg:-mt-0 lg:px-0 lg:pt-0 lg:border-none">
                    <label className="block text-sm font-bold text-text-dim mb-3 uppercase tracking-wider">
                      Available Foods
                    </label>
                    <div className="flex gap-2 h-12">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search foods..."
                        disabled={isLoadingFoods}
                        className="flex-1 px-4 py-3 bg-surface-card border border-white/5 rounded-lg focus:border-primary focus:outline-none disabled:opacity-50"
                      />
                      {isLoadingFoods && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-surface-card rounded-lg border border-white/5 flex-shrink-0">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs font-bold text-text-dim whitespace-nowrap">Loading...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {loadError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-3">
                      <p className="text-sm text-red-400">{loadError}</p>
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                      {isLoadingFoods ? (
                        <p className="text-center text-text-dim py-4">Loading foods...</p>
                      ) : availableFoodsFiltered.length > 0 ? (
                        availableFoodsFiltered.map((food) => (
                          <button
                            key={food.id}
                            onClick={() => handleOpenFoodPopup(food)}
                            className="w-full text-left p-3 bg-surface-card border border-white/5 rounded-lg hover:border-primary/50 transition-all"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm">{food.name}</p>
                                {food.servingSize && (
                                  <p className="text-[9px] text-text-dim">{food.servingSize}</p>
                                )}
                              </div>
                              <p className="text-[9px] font-bold text-primary shrink-0">
                                {food.calories ?? 0} cal
                              </p>
                            </div>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[8px] text-macro-protein font-bold">
                                P: {food.protein ?? 0}g
                              </span>
                              <span className="text-[8px] text-macro-carbs font-bold">
                                C: {food.carbs ?? 0}g
                              </span>
                              <span className="text-[8px] text-macro-fats font-bold">
                                F: {food.fats ?? 0}g
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="text-center text-text-dim py-4">No foods found</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: selected foods */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-text-dim mb-3 uppercase tracking-wider">
                      Your meal ({selectedFoods.length})
                    </h3>
                    <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                      {selectedFoods.length === 0 && (
                        <p className="text-text-dim text-sm">No foods selected yet.</p>
                      )}
                      {selectedFoods.map((food) => (
                        <div
                          key={food.id}
                          className="p-3 bg-primary/10 border border-primary/30 rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm">{food.name}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveFood(food.id)}
                              className="text-red-400 hover:text-red-300 transition-colors shrink-0"
                            >
                              <span className="material-symbols-outlined">close</span>
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={food.servingAmount}
                              onChange={(e) =>
                                handleUpdateFoodServing(food.id, parseFloat(e.target.value))
                              }
                              className="w-20 px-2 py-1 bg-surface-card border border-white/5 rounded text-xs focus:outline-none focus:border-primary"
                              placeholder="1"
                            />
                            <span className="text-sm font-bold text-white">
                              × {food.servingUnit}
                            </span>
                          </div>
                          <div className="flex gap-2 text-[8px] bg-black/20 p-2 rounded">
                            <span className="text-macro-protein font-bold">
                              P: {Math.round(food.baseNutrients.protein)}g
                            </span>
                            <span className="text-macro-carbs font-bold">
                              C: {Math.round(food.baseNutrients.carbs)}g
                            </span>
                            <span className="text-macro-fats font-bold">
                              F: {Math.round(food.baseNutrients.fats)}g
                            </span>
                            <span className="text-orange-400 font-bold">
                              {Math.round(food.baseNutrients.calories)} cal
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {selectedFoods.length > 0 && (
                <div className="bg-surface-card p-4 rounded-lg border border-white/5 mt-4">
                  <h4 className="text-sm font-bold text-text-dim mb-3 uppercase">Totals</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                    <div>
                      <p className="text-[8px] text-text-dim font-bold uppercase">Protein</p>
                      <p className="text-lg font-bold text-macro-protein">
                        {Math.round(calculateTotals.protein)}g
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] text-text-dim font-bold uppercase">Carbs</p>
                      <p className="text-lg font-bold text-macro-carbs">
                        {Math.round(calculateTotals.carbs)}g
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] text-text-dim font-bold uppercase">Fats</p>
                      <p className="text-lg font-bold text-macro-fats">
                        {Math.round(calculateTotals.fats)}g
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] text-text-dim font-bold uppercase">Fiber</p>
                      <p className="text-lg font-bold text-macro-fiber">
                        {Math.round(calculateTotals.fiber)}g
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] text-text-dim font-bold uppercase">Calories</p>
                      <p className="text-lg font-bold text-orange-400">
                        {Math.round(calculateTotals.calories)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer will render BACK and SAVE buttons */}
            </>
          )}
        </div>

        {/* Footer: buttons pinned to bottom */}
        <div className="flex-shrink-0 bg-surface-dark border-t border-white/5 p-6">
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:brightness-110 transition-all"
            >
              NEXT
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-surface-card text-white font-bold py-3 rounded-lg hover:bg-surface-highlight transition-all border border-white/5"
              >
                BACK
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || selectedFoods.length === 0}
                className="flex-1 bg-primary text-white font-bold py-3 rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? "SAVING..." : "SAVE MEAL"}
              </button>
            </div>
          )}
        </div>

        {/* Food Information Popup */}
        {foodPopup.food && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-surface-dark w-full max-w-sm mx-4 rounded-3xl p-6 border border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold font-display">{foodPopup.food.name}</h3>
                  <p className="text-[10px] text-text-dim uppercase tracking-wider">
                    {foodPopup.food.servingSize}
                  </p>
                </div>
                <button
                  onClick={() => setFoodPopup({ food: null, servingAmount: 1, servingUnit: "" })}
                  className="text-text-dim hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Nutrition Information */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-surface-card p-3 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-bold text-text-dim uppercase mb-1">Protein</p>
                  <p className="text-lg font-bold text-macro-protein">{foodPopup.food.protein ?? 0}g</p>
                </div>
                <div className="bg-surface-card p-3 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-bold text-text-dim uppercase mb-1">Carbs</p>
                  <p className="text-lg font-bold text-macro-carbs">{foodPopup.food.carbs ?? 0}g</p>
                </div>
                <div className="bg-surface-card p-3 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-bold text-text-dim uppercase mb-1">Fats</p>
                  <p className="text-lg font-bold text-macro-fats">{foodPopup.food.fats ?? 0}g</p>
                </div>
                <div className="bg-surface-card p-3 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-bold text-text-dim uppercase mb-1">Fiber</p>
                  <p className="text-lg font-bold text-macro-fiber">{foodPopup.food.fiber ?? 0}g</p>
                </div>
                <div className="col-span-2 bg-surface-card p-3 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-bold text-text-dim uppercase mb-1">Calories</p>
                  <p className="text-lg font-bold text-orange-400">{foodPopup.food.calories ?? 0}</p>
                </div>
              </div>

              {/* Serving Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-text-dim mb-3 uppercase tracking-wider">
                  Number of Servings
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={foodPopup.servingAmount}
                    onChange={(e) =>
                      setFoodPopup({
                        ...foodPopup,
                        servingAmount: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1 px-4 py-3 bg-surface-card border border-white/5 rounded-lg focus:border-primary focus:outline-none"
                    placeholder="1"
                  />
                  <span className="text-sm font-bold text-white px-3 py-3 bg-surface-card rounded-lg border border-white/5">
                    × {foodPopup.servingUnit}
                  </span>
                </div>
              </div>

              {/* Calculated Amount */}
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
                <p className="text-[10px] font-bold text-text-dim uppercase mb-3">
                  Amount ({foodPopup.servingAmount} {foodPopup.servingUnit})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[8px] text-text-dim font-bold">Protein</p>
                    <p className="text-sm font-bold text-macro-protein">
                      {Math.round((foodPopup.food.protein ?? 0) * foodPopup.servingAmount)}g
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] text-text-dim font-bold">Carbs</p>
                    <p className="text-sm font-bold text-macro-carbs">
                      {Math.round((foodPopup.food.carbs ?? 0) * foodPopup.servingAmount)}g
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] text-text-dim font-bold">Fats</p>
                    <p className="text-sm font-bold text-macro-fats">
                      {Math.round((foodPopup.food.fats ?? 0) * foodPopup.servingAmount)}g
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] text-text-dim font-bold">Fiber</p>
                    <p className="text-sm font-bold text-macro-fiber">
                      {Math.round((foodPopup.food.fiber ?? 0) * foodPopup.servingAmount)}g
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[8px] text-text-dim font-bold">Calories</p>
                    <p className="text-sm font-bold text-orange-400">
                      {Math.round((foodPopup.food.calories ?? 0) * foodPopup.servingAmount)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddFoodFromPopup}
                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:brightness-110 transition-all"
              >
                ADD TO MEAL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
