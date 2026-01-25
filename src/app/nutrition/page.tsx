"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import NavBar from "@/components/ui/navbar";
import { setPageLoaderOverride } from "@/components/ui/page-loader";
import MealCalendar, { Meal, DayData } from "@/components/nutrition/MealCalendar";
import MealDetails from "@/components/nutrition/MealDetails";
import LogMealModal, { NewMealSession } from "@/components/nutrition/LogMealModal";
import {
  fetchMeals,
  createMeal,
  updateMeal,
  deleteMeal,
  fetchMealDetails,
  fetchMealFoodItems,
  fetchMealNutritionTotals,
  ApiMeal,
  ApiMealsResponse,
  fetchCurrentUser,

  type FoodItem,
} from "@/lib/api/nutrition";
type MacroGoals = {
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  calories: number;
  water: number;
};

const MACRO_GOALS: MacroGoals = {
  protein: 220,
  carbs: 350,
  fats: 80,
  fiber: 40,
  calories: 2600,
  water: 3500,
};

export default function NutritionPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isLogMealModalOpen, setIsLogMealModalOpen] = useState(false);
  const [isLoadingMeals, setIsLoadingMeals] = useState(true);
  const [isSavingMeal, setIsSavingMeal] = useState(false);
  const [isLoadingMealDetails, setIsLoadingMealDetails] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch user ID from API on mount
  useEffect(() => {
    const loadUser = async () => {
      const user = await fetchCurrentUser();
      if (user) {
        const extractedUserId = user.user_id ?? user.id;
        if (extractedUserId) {
          setUserId(extractedUserId);
        } else {
          console.error("User ID not found in API response");
          setIsLoadingMeals(false);
        }
      } else {
        console.error("Failed to fetch user from API");
        setIsLoadingMeals(false);
      }
    };
    loadUser();
  }, []);

  const [mealsData, setMealsData] = useState<Record<string, Meal[]>>({});
  const [mealDetailsMap, setMealDetailsMap] = useState<Record<string, Meal>>({});

  const parseMealDate = (date: string | undefined) => {
    if (!date) return new Date();
    const trimmed = date.trim();
    const [datePart, timePart] = trimmed.split(/[T ]/);
    const [yearStr, monthStr, dayStr] = (datePart || "").split("-");
    const year = Number(yearStr);
    const month = Number(monthStr) - 1;
    const day = Number(dayStr);

    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (timePart) {
      const [h, m, s] = timePart.split(":");
      hours = Number(h) || 0;
      minutes = Number(m) || 0;
      seconds = Number(s) || 0;
    }

    const parsed = new Date(year, month, day, hours, minutes, seconds);
    if (Number.isNaN(parsed.getTime())) {
      return new Date(trimmed);
    }
    return parsed;
  };

  const hasTimePart = (date: string | undefined) => {
    if (!date) return false;
    const trimmed = date.trim();
    return trimmed.includes(" ") || trimmed.includes("T") || trimmed.includes(":");
  };

  const mapApiMealToMeal = useCallback((apiMeal: ApiMeal & { nutritionTotals?: any }, index: number): Meal => {
    // Use nutrition totals from API if available, otherwise calculate from items
    if (apiMeal.nutritionTotals) {
      const { nutritionTotals } = apiMeal;
      const mealName = apiMeal.meal_type 
        ? apiMeal.meal_type.charAt(0).toUpperCase() + apiMeal.meal_type.slice(1).toLowerCase()
        : apiMeal.name || "Meal";

      return {
        id: (apiMeal.meal_id ?? `meal-${Date.now()}-${index}`).toString(),
        meal_id: apiMeal.meal_id,
        name: mealName,
        protein: Math.round(nutritionTotals.protein ?? 0),
        carbs: Math.round(nutritionTotals.carbs ?? 0),
        fats: Math.round(nutritionTotals.fats ?? 0),
        fiber: Math.round(nutritionTotals.fiber ?? 0),
        calories: Math.round(nutritionTotals.calories ?? 0),
        time: apiMeal.meal_time ?? undefined,
        mealType: apiMeal.meal_type ?? "Meal",
        foodItems: [],
      };
    }

    // Fallback: Calculate totals from user_meal_details if available
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalFiber = 0;
    let totalCalories = 0;
    const foodNames: string[] = [];

    if (apiMeal.items && Array.isArray(apiMeal.items)) {
      apiMeal.items.forEach((item: any) => {
        const foods = item.foods || {};
        const multiplier = (item.amount_grams || 100) / 100;
        
        totalProtein += (foods.protein_per_serving || 0) * multiplier;
        totalCarbs += (foods.carbs_per_serving || 0) * multiplier;
        totalFats += (foods.fat_per_serving || 0) * multiplier;
        totalFiber += (foods.fiber || 0) * multiplier;
        totalCalories += (foods.calories_per_serving || 0) * multiplier;
        
        if (foods.name && foods.name.trim()) foodNames.push(foods.name);
      });
    }

    // Use totals if calculated, otherwise fallback to top-level values
    const protein = totalProtein || (apiMeal.protein ?? 0);
    const carbs = totalCarbs || (apiMeal.carbs ?? 0);
    const fats = totalFats || (apiMeal.fats ?? 0);
    const fiber = totalFiber || (apiMeal.fiber ?? 0);
    const calories = totalCalories || (apiMeal.calories ?? 0);
    
    // Use meal type as name since food names are often empty
    const mealName = apiMeal.meal_type 
      ? apiMeal.meal_type.charAt(0).toUpperCase() + apiMeal.meal_type.slice(1).toLowerCase()
      : (foodNames.length > 0 ? foodNames.join(", ") : apiMeal.name || "Meal");

    return {
      id: (apiMeal.meal_id ?? `meal-${Date.now()}-${index}`).toString(),
      meal_id: apiMeal.meal_id,
      name: mealName,
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats),
      fiber: Math.round(fiber),
      calories: Math.round(calories),
      time: apiMeal.meal_time ?? undefined,
      mealType: apiMeal.meal_type ?? "Meal",
      foodItems: [],
    };
  }, []);

  const mapMealsToDays = useCallback((meals: ApiMeal[]) => {
    const record: Record<string, Meal[]> = {};

    if (!Array.isArray(meals)) {
      console.error("Meals is not an array:", meals);
      return record;
    }

    console.log("Processing meals:", meals.length, "items");

    meals.forEach((meal, index) => {
      console.log(`Meal ${index}:`, { meal_date: meal.meal_date, log_date: meal.log_date });
      
      const mealDate = parseMealDate(meal.meal_date || meal.log_date);
      console.log(`Parsed date for meal ${index}:`, mealDate, "Valid:", !Number.isNaN(mealDate.getTime()));
      
      if (Number.isNaN(mealDate.getTime())) {
        console.warn("Invalid meal date", meal.meal_date, meal);
        return;
      }

      const dayKey = mealDate.getDate().toString();
      console.log(`Day key: ${dayKey}`);
      
      const mapped = mapApiMealToMeal(meal, index);
      record[dayKey] = [...(record[dayKey] || []), mapped];
    });

    console.log('Mapped meals to days:', record);
    return record;
  }, [mapApiMealToMeal]);

  const normalizeMeals = (response: ApiMealsResponse | any): ApiMeal[] => {
    // Handle if response is an array directly (not wrapped in { data: [...] })
    const dataArray = Array.isArray(response) ? response : response.data;
    
    if (!Array.isArray(dataArray)) {
      console.warn("Response data is not an array:", response);
      return [];
    }

    const flattened: ApiMeal[] = [];
    for (const item of dataArray as any[]) {
      // If it's an ApiMeal, push directly
      if (item && (item.meal_id || item.id || item.name)) {
        // Normalize date field names: log_date or meal_date
        // Map user_meal_details to items for compatibility
        const normalized: ApiMeal = {
          ...item,
          meal_date: item.log_date ?? item.meal_date ?? new Date().toISOString().split('T')[0],
          items: item.user_meal_details || item.items || [],
        };
        flattened.push(normalized);
        continue;
      }

      // If it's a day group (ApiDayNutrition), flatten meals
      if (item && Array.isArray(item.meals)) {
        const dayDate: string | undefined = item.day ?? item.log_date;
        for (const m of item.meals) {
          // Ensure meal has a date; fallback to the day's date
          const withDate: ApiMeal = {
            ...m,
            meal_date: m.log_date ?? m.meal_date ?? dayDate ?? new Date().toISOString().split("T")[0],
            items: m.user_meal_details || m.items || [],
          };
          flattened.push(withDate);
        }
      }
    }

    console.log('Normalized meals:', flattened);
    return flattened;
  };

  const refreshMeals = useCallback(async () => {
    if (!userId) return;
    
    setIsLoadingMeals(true);
    setErrorMessage(null);
    try {
      const monthParam = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
      const response = await fetchMeals(userId, monthParam);
      console.log("Meals response:", response);
      const mealsArray = normalizeMeals(response);
      
      // Fetch nutrition data for each meal in parallel
      const mealsWithNutrition = await Promise.all(
        mealsArray.map(async (meal) => {
          if (meal.meal_id) {
            try {
              const nutrition = await fetchMealNutritionTotals(meal.meal_id);
              return {
                ...meal,
                nutritionTotals: nutrition,
              };
            } catch (error) {
              console.warn(`Failed to fetch nutrition for meal ${meal.meal_id}`, error);
              return meal;
            }
          }
          return meal;
        })
      );
      
      setMealsData(mapMealsToDays(mealsWithNutrition));
    } catch (error) {
      console.error("Failed to load meals", error);
      setErrorMessage(error instanceof Error ? error.message : "Unable to load meals");
    } finally {
      setIsLoadingMeals(false);
    }
  }, [userId, mapMealsToDays, selectedMonth, selectedYear]);

  useEffect(() => {
    refreshMeals();
  }, [refreshMeals]);

  useEffect(() => {
    // Hold the single global loader while meals are loading
    setPageLoaderOverride(isLoadingMeals ? true : null);
    return () => setPageLoaderOverride(null);
  }, [isLoadingMeals]);

  const handleMonthYearChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleMealClick = async (meal: Meal, day: number) => {
    setIsLoadingMealDetails(true);
    try {
      // Fetch detailed food items and nutrition totals for this meal
      if (meal.meal_id) {
        const foodItems = await fetchMealFoodItems(meal.meal_id);
        const nutritionTotals = await fetchMealNutritionTotals(meal.meal_id);
        
        // Use API nutrition totals if available, otherwise keep existing values
        const updatedMeal = {
          ...meal,
          foodItems,
          ...(nutritionTotals && {
            protein: nutritionTotals.protein ?? meal.protein,
            carbs: nutritionTotals.carbs ?? meal.carbs,
            fats: nutritionTotals.fats ?? meal.fats,
            fiber: nutritionTotals.fiber ?? meal.fiber,
            calories: nutritionTotals.calories ?? meal.calories,
          }),
        };
        setSelectedMeal(updatedMeal);
      } else {
        setSelectedMeal(meal);
      }
    } catch (error) {
      console.error("Error loading meal:", error);
      setSelectedMeal(meal);
    } finally {
      setIsLoadingMealDetails(false);
    }
  };

  const handleSaveMeal = async (newMeal: NewMealSession) => {
    if (!userId) {
      setErrorMessage("User ID not available");
      return;
    }
    
    setIsSavingMeal(true);
    try {
      const payload = {
        userId: userId,
        mealDate: newMeal.date,
        mealTime: newMeal.time,
        mealType: newMeal.mealType,
        name: newMeal.name,
        protein: newMeal.protein,
        carbs: newMeal.carbs,
        fats: newMeal.fats,
        fiber: newMeal.fiber,
        calories: newMeal.calories,
        items: newMeal.items,
        notes: newMeal.notes,
      };

      await createMeal(payload);
      await refreshMeals();
      setIsLogMealModalOpen(false);
    } catch (error) {
      console.error("Failed to save meal", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to save meal");
    } finally {
      setIsSavingMeal(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    setIsSavingMeal(true);
    try {
      await deleteMeal(mealId);
      await refreshMeals();
      setSelectedMeal(null);
    } catch (error) {
      console.error("Failed to delete meal", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete meal");
    } finally {
      setIsSavingMeal(false);
    }
  };

  const handleUpdateMeal = async (mealId: string, updates: Partial<Meal>) => {
    setIsSavingMeal(true);
    try {
      await updateMeal({
        mealId,
        mealTime: updates.time,
        name: updates.name,
        protein: updates.protein,
        carbs: updates.carbs,
        fats: updates.fats,
        fiber: updates.fiber,
        calories: updates.calories,
      });
      await refreshMeals();
      setSelectedMeal(null);
    } catch (error) {
      console.error("Failed to update meal", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to update meal");
    } finally {
      setIsSavingMeal(false);
    }
  };

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const year = selectedYear;
    const month = selectedMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const today = new Date();

    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: DayData[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        meals: [],
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const meals = mealsData[day.toString()] || [];
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      days.push({
        day,
        isCurrentMonth: true,
        meals,
        isToday,
      });
    }

    const remainingDays = 35 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        meals: [],
      });
    }

    return days;
  }, [selectedYear, selectedMonth, mealsData]);

  // Get selected day data
  const selectedDay = useMemo(() => {
    const today = new Date().getDate();
    const dayMeals = mealsData[today.toString()] || [];

    const totals = dayMeals.reduce(
      (acc, meal) => ({
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fats: acc.fats + meal.fats,
        fiber: acc.fiber + meal.fiber,
        calories: acc.calories + meal.calories,
        water: 2400,
        meals: dayMeals,
      }),
      {
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        calories: 0,
        water: 2400,
        meals: dayMeals,
      }
    );

    return totals;
  }, [mealsData]);

  const calculateProgress = (current: number, goal: number) => {
    return Math.min(100, (current / goal) * 100);
  };

  const MacroCard = ({
    label,
    icon,
    current,
    goal,
    color,
    unit,
  }: {
    label: string;
    icon: string;
    current: number;
    goal: number;
    color: string;
    unit: string;
  }) => {
    const progress = calculateProgress(current, goal);
    return (
      <div className="bg-surface-card border border-white/5 p-4 rounded-3xl">
        <div className="flex justify-between items-start mb-4">
          <span className={`material-symbols-outlined ${color} text-xl`}>
            {icon}
          </span>
          <p className="text-[9px] font-bold text-text-dim uppercase tracking-wider">
            {label}
          </p>
        </div>
        <h3 className="text-xl font-display font-bold">
          {current}
          <span className="text-xs text-text-dim font-normal">
            /{goal}
            {unit}
          </span>
        </h3>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-[8px] text-text-dim mt-2 font-bold">
          {Math.round(progress)}% Complete
        </p>
      </div>
    );
  };

  const mealCount = useMemo(() => {
    return Object.values(mealsData).reduce((acc, meals) => acc + meals.length, 0);
  }, [mealsData]);

  return (
    <div className="bg-background-dark text-white min-h-screen">
      <NavBar className="hidden lg:block" />

      {/* Single global loader in app handles loading state; no extra overlay here */}

      <main className="pt-16 pb-24 overflow-y-auto">
        {/* Desktop Layout */}
        <div className="hidden lg:flex h-[calc(100vh-4rem)]">
          {/* Daily Macros Sidebar */}
          <aside className="w-72 border-r border-white/5 bg-surface-dark p-6 flex flex-col gap-8 shrink-0 overflow-y-auto">
            <div>
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-text-dim uppercase mb-4">
                Daily Progress
              </h3>
              <div className="space-y-3">
                <MacroCard
                  label="Protein"
                  icon="egg_alt"
                  current={selectedDay.protein}
                  goal={MACRO_GOALS.protein}
                  color="text-macro-protein"
                  unit="g"
                />
                <MacroCard
                  label="Carbs"
                  icon="bakery_dining"
                  current={selectedDay.carbs}
                  goal={MACRO_GOALS.carbs}
                  color="text-macro-carbs"
                  unit="g"
                />
                <MacroCard
                  label="Fats"
                  icon="water_drop"
                  current={selectedDay.fats}
                  goal={MACRO_GOALS.fats}
                  color="text-macro-fats"
                  unit="g"
                />
                <MacroCard
                  label="Fiber"
                  icon="eco"
                  current={selectedDay.fiber}
                  goal={MACRO_GOALS.fiber}
                  color="text-macro-fiber"
                  unit="g"
                />
                <MacroCard
                  label="Calories"
                  icon="local_fire_department"
                  current={selectedDay.calories}
                  goal={MACRO_GOALS.calories}
                  color="text-orange-400"
                  unit=""
                />
                <MacroCard
                  label="Hydration"
                  icon="opacity"
                  current={selectedDay.water}
                  goal={MACRO_GOALS.water}
                  color="text-blue-400"
                  unit="ml"
                />
              </div>
            </div>

            <button
              onClick={() => setIsLogMealModalOpen(true)}
              className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:brightness-110 transition-all mt-auto"
            >
              LOG MEAL
            </button>
          </aside>

          {/* Main Calendar Content */}
          <MealCalendar
            month={monthNames[selectedMonth]}
            year={selectedYear}
            mealsCount={mealCount}
            days={calendarDays}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onMealClick={handleMealClick}
          />

          {/* Meal Details */}
          {selectedMeal && (
            <MealDetails
              meal={selectedMeal}
              onClose={() => setSelectedMeal(null)}
              onDelete={() => handleDeleteMeal(selectedMeal.id)}
              onUpdate={(updates) => handleUpdateMeal(selectedMeal.id, updates)}
              isSaving={isSavingMeal || isLoadingMealDetails}
            />
          )}
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <MealCalendar
            month={monthNames[selectedMonth]}
            year={selectedYear}
            mealsCount={mealCount}
            days={calendarDays}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onMealClick={handleMealClick}
          />

          {/* Mobile Floating Button */}
          <button
            onClick={() => setIsLogMealModalOpen(true)}
            className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:brightness-110 transition-all"
          >
            <span className="material-symbols-outlined">add</span>
          </button>

          {/* Mobile Meal Details Modal */}
          {selectedMeal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end animate-in fade-in duration-200">
              <div className="w-full bg-surface-dark rounded-t-3xl max-h-[85vh] overflow-hidden animate-slide-up">
                <MealDetails
                  meal={selectedMeal}
                  onClose={() => setSelectedMeal(null)}
                  onDelete={() => handleDeleteMeal(selectedMeal.id)}
                  onUpdate={(updates) => handleUpdateMeal(selectedMeal.id, updates)}
                  isSaving={isSavingMeal}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Log Meal Modal */}
      <LogMealModal
        isOpen={isLogMealModalOpen}
        onClose={() => setIsLogMealModalOpen(false)}
        onSubmit={handleSaveMeal}
      />

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
