"use client";

import { useState, useMemo } from "react";
import NavBar from "@/components/ui/navbar";
import { CalendarLume } from "@/components/ui/calendar-lume";
import MealCalendar from "@/components/nutrition/MealCalendar";
import type { DayData as MealDayData } from "@/components/nutrition/MealCalendar";

type MacroGoals = {
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  calories: number;
  water: number;
};

type Meal = {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  calories: number;
  time?: string;
  icon?: string;
  items?: string[];
};

type NutritionDay = {
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  calories: number;
  water: number;
  meals: Meal[];
};

const MACRO_GOALS: MacroGoals = {
  protein: 220,
  carbs: 350,
  fats: 80,
  fiber: 40,
  calories: 2600,
  water: 3500,
};

const mockNutritionData: Record<number, NutritionDay> = {
  1: {
    protein: 182,
    carbs: 310,
    fats: 68,
    fiber: 32,
    calories: 2450,
    water: 2400,
    meals: [
      {
        id: "m1",
        name: "Oats with Whey & Blueberries",
        protein: 42,
        carbs: 65,
        fats: 8,
        fiber: 8,
        calories: 420,
        time: "7:00 AM",
        icon: "wb_sunny",
        items: ["50g oats", "30g whey", "150g blueberries"],
      },
      {
        id: "m2",
        name: "Grilled Chicken Breast with Rice",
        protein: 56,
        carbs: 85,
        fats: 4,
        fiber: 3,
        calories: 670,
        time: "1:00 PM",
        icon: "lunch_dining",
        items: ["200g chicken", "200g basmati rice", "150g broccoli"],
      },
    ],
  },
};

export default function NutritionPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarStep, setCalendarStep] = useState<"year" | "month">("year");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  const handleMonthYearChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setIsCalendarOpen(false);
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    interface LocalDayData {
      day: number;
      isCurrentMonth: boolean;
      meals: Meal[];
    }

    const year = selectedYear;
    const month = selectedMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: LocalDayData[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        meals: [],
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = mockNutritionData[day];
      days.push({
        day,
        isCurrentMonth: true,
        meals: dayData?.meals || [],
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
  }, [selectedYear, selectedMonth]);

  // Get selected day data
  const selectedDay = useMemo(() => {
    const today = new Date().getDate();
    return mockNutritionData[today] || {
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      calories: 0,
      water: 2400,
      meals: [],
    };
  }, []);

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
          <span className={`material-symbols-outlined ${color} text-xl`}>{icon}</span>
          <p className="text-[9px] font-bold text-text-dim uppercase tracking-wider">{label}</p>
        </div>
        <h3 className="text-xl font-display font-bold">
          {current}
          <span className="text-xs text-text-dim font-normal">/{goal}{unit}</span>
        </h3>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-3">
          <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-[8px] text-text-dim mt-2 font-bold">{Math.round(progress)}% Complete</p>
      </div>
    );
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

  const handleMealClick = (meal: Meal, day: number) => {
    setSelectedMeal(meal);
  };

  const mealCount = useMemo(() => {
    return Object.values(mockNutritionData).reduce((acc, day) => acc + (day.meals?.length || 0), 0);
  }, []);

  return (
    <div className="bg-background-dark text-white min-h-screen">
      <NavBar />

      <main className="pt-16 pb-24 overflow-y-auto">
        {/* Desktop Sidebar - Hidden on mobile */}
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
          </aside>

          {/* Main Calendar Content */}
          <MealCalendar
            month={monthNames[selectedMonth]}
            year={selectedYear}
            mealsCount={mealCount}
            days={calendarDays as MealDayData[]}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onMealClick={handleMealClick}
          />
        </div>

        {/* Mobile Layout - Hidden on desktop */}
        <div className="lg:hidden p-5 pb-24 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-white uppercase italic leading-tight">
              Nutrition
            </h1>
            <p className="text-[11px] text-text-dim mt-0.5 font-medium leading-relaxed">
              Track daily macros and meals.
            </p>
          </div>

          {/* Daily Macros Grid */}
          <section>
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase font-display text-text-dim mb-3 px-1">
              Daily Progress
            </h3>
            <div className="grid grid-cols-2 gap-3">
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
          </section>

          {/* Month Navigation */}
          <div className="relative max-w-xs">
            <button
              onClick={() => {
                setCalendarStep("year");
                setIsCalendarOpen(true);
              }}
              className="w-full bg-surface-card border border-white/5 rounded-xl px-4 py-3 hover:border-white/10 transition-colors text-left"
            >
              <span className="text-[10px] uppercase tracking-[0.16em] text-text-dim font-bold block mb-1">
                Select Period
              </span>
              <p className="text-lg font-display font-bold text-white">
                {monthNames[selectedMonth]} {selectedYear}
              </p>
            </button>

            {isCalendarOpen && (
              <div className="absolute top-full left-0 mt-3 z-50 animate-in fade-in duration-200">
                <CalendarLume
                  defaultMonth={selectedMonth}
                  defaultYear={selectedYear}
                  onMonthYearChange={handleMonthYearChange}
                  initialStep={calendarStep}
                  onClose={() => setIsCalendarOpen(false)}
                />
              </div>
            )}
          </div>

          {/* Meals Calendar Grid */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase font-display text-text-dim">Meals</h3>
            </div>

            {/* Calendar Header - Day names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="text-center text-[9px] font-bold text-text-dim uppercase mb-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((dayData, idx) => {
                const dayNutrition = mockNutritionData[dayData.day];
                const hasMeals = dayData.isCurrentMonth && dayNutrition?.meals?.length;

                return (
                  <div
                    key={idx}
                    onClick={() => hasMeals && setSelectedMeal(dayNutrition.meals[0])}
                    className={`bg-surface-card border rounded-2xl p-3 text-center aspect-square flex flex-col items-center justify-center ${
                      dayData.isCurrentMonth ? "border-white/5 cursor-pointer hover:border-primary/50 transition-colors" : "border-white/5 opacity-30"
                    }`}
                  >
                    <p className="text-sm font-bold font-display mb-1">{dayData.day}</p>
                    {hasMeals ? (
                      <div className="flex flex-col gap-1">
                        <div className="h-1 w-4 bg-macro-protein rounded-full"></div>
                        <div className="h-1 w-4 bg-macro-carbs rounded-full"></div>
                        <div className="h-1 w-4 bg-macro-fats rounded-full"></div>
                      </div>
                    ) : (
                      <div className="h-1 w-4 bg-white/10 rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Meal Details Modal */}
        {selectedMeal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
            <div className="w-full bg-surface-dark rounded-t-3xl max-h-[85vh] overflow-y-auto flex flex-col animate-slide-up">
              <div className="sticky top-0 bg-surface-dark border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-display font-bold uppercase">{selectedMeal.name}</h2>
                <button
                  onClick={() => setSelectedMeal(null)}
                  className="p-2 hover:bg-surface-card rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex-1 p-6 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-card p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-bold text-text-dim uppercase mb-2">Protein</p>
                    <p className="text-2xl font-display font-bold">{selectedMeal.protein}g</p>
                  </div>
                  <div className="bg-surface-card p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-bold text-text-dim uppercase mb-2">Carbs</p>
                    <p className="text-2xl font-display font-bold">{selectedMeal.carbs}g</p>
                  </div>
                  <div className="bg-surface-card p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-bold text-text-dim uppercase mb-2">Fats</p>
                    <p className="text-2xl font-display font-bold">{selectedMeal.fats}g</p>
                  </div>
                  <div className="bg-surface-card p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-bold text-text-dim uppercase mb-2">Calories</p>
                    <p className="text-2xl font-display font-bold">{selectedMeal.calories}</p>
                  </div>
                </div>

                {selectedMeal.items && selectedMeal.items.length > 0 && (
                  <div className="bg-surface-card p-4 rounded-2xl border border-white/5">
                    <h3 className="text-[10px] font-bold text-text-dim uppercase mb-3 tracking-wider">Ingredients</h3>
                    <ul className="space-y-2">
                      {selectedMeal.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-white">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:brightness-110 transition-all">
                  Edit Meal
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
