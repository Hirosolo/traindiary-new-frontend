"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FoodItem } from "@/lib/api/nutrition";

export interface Meal {
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
  mealType?: string;
  status?: "logged" | "pending";
  meal_id?: number | string;
  meal_detail_id?: number | string;
  foodItems?: FoodItem[];
}

export interface DayData {
  day: number;
  isCurrentMonth: boolean;
  meals: Meal[];
  isToday?: boolean;
}

interface MealCalendarProps {
  month: string;
  year: number;
  mealsCount: number;
  days: DayData[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onMealClick: (meal: Meal, day: number) => void;
}

export default function MealCalendar({
  month,
  year,
  mealsCount,
  days,
  onPrevMonth,
  onNextMonth,
  onMealClick,
}: MealCalendarProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const handleDayClick = (day: number, hasMeals: boolean) => {
    if (!hasMeals) return;
    setExpandedDay(day);
  };

  const expandedDayData = useMemo(
    () => days.find((d) => d.isCurrentMonth && d.day === expandedDay),
    [days, expandedDay]
  );

  return (
    <>
      <main className="flex-1 bg-background-dark overflow-y-auto p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-display font-bold">
                {month} {year}
              </h2>
              <p className="text-text-dim text-sm lg:text-base">
                You've logged {mealsCount} meals this month. Keep tracking.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onPrevMonth}
                className="p-2 rounded-lg bg-surface-card border border-white/5 hover:bg-surface-highlight"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={onNextMonth}
                className="p-2 rounded-lg bg-surface-card border border-white/5 hover:bg-surface-highlight"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div
                key={d}
                className="bg-surface-dark py-2 lg:py-3 text-center text-[9px] lg:text-[10px] font-bold text-text-dim uppercase tracking-widest border-b border-white/5"
              >
                {d}
              </div>
            ))}

            {/* Days */}
            {days.map((dayData, index) => {
              const hasMeals = dayData.meals.length > 0;
              const isExpanded = expandedDay === dayData.day;
              const loggedMeals = dayData.meals.filter((m) => m.status === "logged").length;

              return (
                <div
                  key={index}
                  className={`bg-background-dark p-2 lg:p-3 relative group transition-colors h-[120px] lg:h-[144px] overflow-visible ${
                    hasMeals ? "cursor-pointer hover:bg-surface-dark" : ""
                  } ${dayData.isToday ? "ring-2 ring-primary ring-inset" : ""}`}
                  onClick={() => handleDayClick(dayData.day, hasMeals)}
                >
                  <span
                    className={`text-xs lg:text-sm font-medium ${
                      !dayData.isCurrentMonth
                        ? "text-white/20"
                        : dayData.isToday
                        ? "text-primary"
                        : hasMeals
                        ? "text-white"
                        : "text-text-dim"
                    }`}
                  >
                    {dayData.day}
                  </span>

                  {/* Meal indicators when collapsed */}
                  {hasMeals && (
                    <div
                      className="mt-2 lg:mt-3 grid grid-rows-3 gap-1.5"
                      style={{ height: "calc(100% - 28px)" }}
                    >
                      {dayData.meals.slice(0, 3).map((meal) => (
                        <div
                          key={meal.id}
                          className="relative rounded-md overflow-hidden border border-white/5 bg-white/5 h-full"
                        >
                          <div
                            className={`absolute inset-0 transition-all duration-300 ease-out origin-left ${
                              meal.status === "logged" ? "bg-primary" : "bg-primary/30"
                            }`}
                            style={{ opacity: 0.85, transform: isExpanded ? "scaleX(1)" : "scaleX(0.98)" }}
                          />
                          <div className="relative flex items-center justify-between px-2 text-[8px] lg:text-[9px] font-semibold text-white/80 h-full">
                            <span className="truncate">{meal.name}</span>
                            {meal.time && <span className="text-[7px] lg:text-[8px] text-white/60">{meal.time}</span>}
                          </div>
                        </div>
                      ))}
                      {dayData.meals.length > 3 && (
                        <div className="text-[9px] lg:text-[10px] text-text-dim font-bold px-0.5">
                          +{dayData.meals.length - 3} more hidden
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Expanded day details modal - same UI as WorkoutCalendar */}
      <AnimatePresence>
        {expandedDay !== null && expandedDayData && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center px-4 sm:px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/70"
              onClick={() => setExpandedDay(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative w-full max-w-xl lg:max-w-3xl bg-surface-card border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
            >
              <div className="flex items-start justify-between gap-3 p-4 lg:p-5 border-b border-white/10">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-text-dim font-bold">
                    {month} {expandedDay}
                  </p>
                  <p className="text-lg lg:text-xl font-display font-bold text-white">
                    {expandedDayData.meals.length} meal{expandedDayData.meals.length > 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setExpandedDay(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="px-4 lg:px-5 py-3 lg:py-4 space-y-3 max-h-[70vh] overflow-y-auto">
                {expandedDayData.meals.length > 0 ? (
                  expandedDayData.meals.map((meal, idx) => (
                    <motion.div
                      key={meal.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, type: "spring", stiffness: 240, damping: 20 }}
                      className="bg-surface-dark/80 rounded-xl border border-white/5 p-3 lg:p-4 shadow-md shadow-black/20 flex flex-col gap-2 cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => {
                        onMealClick(meal, expandedDay);
                        setExpandedDay(null);
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm lg:text-base font-semibold text-white truncate">{meal.name}</p>
                          {meal.time && (
                            <p className="text-[11px] lg:text-xs text-text-dim uppercase font-bold">{meal.time}</p>
                          )}
                          {meal.items && meal.items.length > 0 && (
                            <p className="text-xs lg:text-sm text-text-dim mt-1 line-clamp-2">
                              {meal.items.slice(0, 3).join(" • ")}
                              {meal.items.length > 3 ? ` +${meal.items.length - 3}` : ""}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-[11px] lg:text-xs font-bold px-2 py-1 rounded-md bg-primary/20 text-primary">
                          {Math.round(meal.calories)} kcal
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-[10px] lg:text-xs">
                        <div>
                          <p className="text-text-dim font-bold uppercase">P</p>
                          <p className="font-bold text-macro-protein">{Math.round(meal.protein)}g</p>
                        </div>
                        <div>
                          <p className="text-text-dim font-bold uppercase">C</p>
                          <p className="font-bold text-macro-carbs">{Math.round(meal.carbs)}g</p>
                        </div>
                        <div>
                          <p className="text-text-dim font-bold uppercase">F</p>
                          <p className="font-bold text-macro-fats">{Math.round(meal.fats)}g</p>
                        </div>
                        <div>
                          <p className="text-text-dim font-bold uppercase">Fiber</p>
                          <p className="font-bold text-macro-fiber">{Math.round(meal.fiber)}g</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMealClick(meal, expandedDay);
                            setExpandedDay(null);
                          }}
                          className="text-xs lg:text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                          Open details
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32 text-text-dim">
                    <p className="text-sm">No meals logged for this day</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}