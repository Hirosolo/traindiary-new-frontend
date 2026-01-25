"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/line-chart";
import { CalendarLume } from "@/components/ui/calendar-lume";
import NavBar from "@/components/ui/navbar";
import { CircularProgress } from "@/components/ui/circular-progress";

type SummaryPoint = {
  label: string;
  dateLabel: string;
  workouts: number;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  gr: number;
};

function formatDateLabel(d: Date) {
  const dd = `${d.getDate()}`.padStart(2, "0");
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function buildMonthlyData(year: number, monthIndex: number): SummaryPoint[] {
  // monthIndex: 0-11
  const start = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, monthIndex, i + 1);
    const label = `${d.getDate()}`.padStart(2, "0");
    return {
      label,
      dateLabel: formatDateLabel(d),
      workouts: Math.random() > 0.65 ? 1 : 0,
      kcal: 2600 + Math.round(Math.random() * 600),
      protein: 170 + Math.round(Math.random() * 50),
      carbs: 300 + Math.round(Math.random() * 100),
      fats: 80 + Math.round(Math.random() * 30),
      fiber: 30 + Math.round(Math.random() * 15),
      sugar: Math.round(Math.random() * 50),
      gr: 85 + Math.round(Math.random() * 12),
    } satisfies SummaryPoint;
  });
}


export default function SummaryPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarStep, setCalendarStep] = useState<"year" | "month">("year");
  const [activeTab, setActiveTab] = useState<"nutrition" | "workout">("nutrition");
  const [nutritionGraphType, setNutritionGraphType] = useState<"all" | "hydration">("all");
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [userId, setUserId] = useState<number | null>(null);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  
  const dataset = useMemo(() => buildMonthlyData(selectedYear, selectedMonth), [selectedMonth, selectedYear]);

  // Fetch user ID on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
        if (response.ok) {
          const user = await response.json();
          const extractedUserId = user.user_id ?? user.id;
          if (extractedUserId) {
            setUserId(extractedUserId);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    loadUser();
  }, []);

  // Fetch workout data when tab is active
  useEffect(() => {
    if (activeTab === "workout" && userId) {
      const loadWorkouts = async () => {
        setIsLoadingWorkouts(true);
        try {
          const monthParam = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
          const response = await fetch(
            `/api/workout-sessions?user_id=${userId}&month=${monthParam}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
              },
            }
          );
          if (response.ok) {
            const sessions = await response.json();
            const exerciseMap: Record<string, { name: string; count: number; volume: number }> = {};
            
            const sessionsArray = Array.isArray(sessions) ? sessions : sessions.sessions || [];
            sessionsArray.forEach((session: any) => {
              if (session.session_details && Array.isArray(session.session_details)) {
                session.session_details.forEach((detail: any) => {
                  const exerciseName = detail.exercises?.name || `Exercise ${detail.exercise_id}`;
                  if (!exerciseMap[exerciseName]) {
                    exerciseMap[exerciseName] = { name: exerciseName, count: 0, volume: 0 };
                  }
                  if (detail.exercise_logs && Array.isArray(detail.exercise_logs)) {
                    detail.exercise_logs.forEach((log: any) => {
                      exerciseMap[exerciseName].count += 1;
                      exerciseMap[exerciseName].volume += (log.actual_sets || 0) * (log.actual_reps || 0) * (log.weight_kg || 0);
                    });
                  }
                });
              }
            });
            
            const chartData = Object.values(exerciseMap);
            setWorkoutData(chartData);
            
            // Set first exercise as default
            if (chartData.length > 0 && !selectedExercise) {
              setSelectedExercise(chartData[0].name);
            }
          }
        } catch (error) {
          console.error("Failed to load workouts:", error);
        } finally {
          setIsLoadingWorkouts(false);
        }
      };
      loadWorkouts();
    }
  }, [activeTab, userId, selectedMonth, selectedYear]);

  const handleMonthYearChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setIsCalendarOpen(false);
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const totals = useMemo(() => {
    const count = dataset.length || 1;
    const totalWorkouts = dataset.reduce((sum, d) => sum + d.workouts, 0);
    const avgKcal = Math.round(dataset.reduce((sum, d) => sum + d.kcal, 0) / count);
    const avgProtein = Math.round(dataset.reduce((sum, d) => sum + d.protein, 0) / count);
    const avgGR = Math.round(dataset.reduce((sum, d) => sum + d.gr, 0) / count);
    return { totalWorkouts, avgKcal, avgProtein, avgGR };
  }, [dataset]);

  return (
    <div className="bg-background-dark text-white min-h-screen">
      <NavBar className="hidden lg:block" />

      <main className="pt-16 pb-24 overflow-y-auto">
        <div className="p-5 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-display tracking-tight text-white uppercase italic leading-tight">
              Summary
            </h1>
            <p className="text-[11px] text-text-dim mt-0.5 font-medium leading-relaxed">
              Monthly performance snapshot.
            </p>
          </div>

          {/* Month/Year Selector */}
          <div className="relative max-w-xs">
            <button
              onClick={() => {
                setCalendarStep("year");
                setIsCalendarOpen(true);
              }}
              className="w-full bg-surface-card border border-white/5 rounded-xl px-4 py-3 hover:border-white/10 transition-colors text-left flex flex-col items-start gap-1"
            >
              <span className="text-[10px] uppercase tracking-[0.16em] text-text-dim font-bold block mb-2">
                Select Period
              </span>
              <div className="flex flex-col">
                <span className="text-sm text-text-dim font-medium">
                  {monthNames[selectedMonth]}
                </span>
                <p className="text-2xl font-display font-bold text-white">
                  {selectedYear}
                </p>
              </div>
            </button>

            {/* Calendar Modal - Fixed Position */}
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
        </div>

        {/* Stats Circular Graphs */}
        <div className="px-5 grid grid-cols-2 lg:grid-cols-4 gap-6 py-8">
          <div className="flex justify-center">
            <CircularProgress
              value={totals.totalWorkouts}
              max={20}
              label="Workouts"
              icon="fitness_center"
              color="text-blue-500"
              size={160}
              strokeWidth={7}
            />
          </div>

          <div className="flex justify-center">
            <CircularProgress
              value={totals.avgKcal}
              max={3500}
              label="Avg Kcal"
              icon="local_fire_department"
              color="text-orange-500"
              size={160}
              strokeWidth={7}
            />
          </div>

          <div className="flex justify-center">
            <CircularProgress
              value={totals.avgProtein}
              max={250}
              label="Avg Protein"
              unit="g"
              icon="egg_alt"
              color="text-purple-500"
              size={160}
              strokeWidth={7}
            />
          </div>

          <div className="flex justify-center">
            <CircularProgress
              value={totals.avgGR}
              max={100}
              label="GR Score"
              icon="bolt"
              color="text-primary"
              size={160}
              strokeWidth={7}
            />
          </div>
        </div>

        {/* Charts - Tabbed View */}
        <div className="px-5 mt-8">
          {/* Tab Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setActiveTab("nutrition")}
              className={`px-6 py-3 rounded-xl font-bold transition-all text-sm ${
                activeTab === "nutrition"
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-surface-card border border-white/5 text-text-dim hover:border-white/10"
              }`}
            >
              Nutrition
            </button>
            <button
              onClick={() => setActiveTab("workout")}
              className={`px-6 py-3 rounded-xl font-bold transition-all text-sm ${
                activeTab === "workout"
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-surface-card border border-white/5 text-text-dim hover:border-white/10"
              }`}
            >
              Workout
            </button>
          </div>

          {/* Nutrition Tab */}
          {activeTab === "nutrition" && (
            <div className="space-y-6">
              {/* Nutrition Sub-tabs */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setNutritionGraphType("all")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all text-xs ${
                    nutritionGraphType === "all"
                      ? "bg-primary text-white"
                      : "bg-surface-card border border-white/5 text-text-dim hover:border-white/10"
                  }`}
                >
                  All Nutrition
                </button>
                <button
                  onClick={() => setNutritionGraphType("hydration")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all text-xs ${
                    nutritionGraphType === "hydration"
                      ? "bg-primary text-white"
                      : "bg-surface-card border border-white/5 text-text-dim hover:border-white/10"
                  }`}
                >
                  Hydration
                </button>
              </div>

              {/* All Nutrition Graph */}
              {nutritionGraphType === "all" && (
                <section className="rounded-[2rem] bg-surface-card p-5 border border-white/5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-bold tracking-tight text-white uppercase font-display italic">
                        Complete Nutrition Profile
                      </h3>
                      <p className="text-[9px] text-text-dim font-medium uppercase tracking-wider mt-0.5">
                        All macros and calories per day
                      </p>
                    </div>
                  </div>
                  <ChartContainer
                    className="h-[360px] w-full rounded-xl border border-white/5 bg-surface-card"
                    config={{
                      kcal: { label: "Calories", color: "#f97316" },
                      protein: { label: "Protein", color: "#a855f7" },
                      carbs: { label: "Carbs", color: "#3b82f6" },
                      fats: { label: "Fats", color: "#ec4899" },
                      fiber: { label: "Fiber", color: "#22c55e" },
                      sugar: { label: "Sugar", color: "#ef4444" },
                    }}
                  >
                    <LineChart
                      accessibilityLayer
                      data={dataset}
                      margin={{ top: 12, left: 16, right: 16, bottom: 12 }}
                    >
                      <CartesianGrid strokeDasharray="6 6" stroke="rgba(255,255,255,0.1)" />
                      <XAxis
                        dataKey="dateLabel"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        tick={{ fill: "#9CA3AF", fontSize: 10, letterSpacing: 0.5 }}
                      />
                      <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Line
                        type="monotone"
                        dataKey="kcal"
                        name="Calories"
                        stroke="var(--color-kcal)"
                        strokeWidth={3}
                        dot={{ r: 3, fill: "var(--color-kcal)", strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="protein"
                        name="Protein"
                        stroke="var(--color-protein)"
                        strokeWidth={3}
                        dot={{ r: 3, fill: "var(--color-protein)", strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="carbs"
                        name="Carbs"
                        stroke="var(--color-carbs)"
                        strokeWidth={3}
                        dot={{ r: 3, fill: "var(--color-carbs)", strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="fats"
                        name="Fats"
                        stroke="var(--color-fats)"
                        strokeWidth={3}
                        dot={{ r: 3, fill: "var(--color-fats)", strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="fiber"
                        name="Fiber"
                        stroke="var(--color-fiber)"
                        strokeWidth={3}
                        dot={{ r: 3, fill: "var(--color-fiber)", strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="sugar"
                        name="Sugar"
                        stroke="var(--color-sugar)"
                        strokeWidth={3}
                        dot={{ r: 3, fill: "var(--color-sugar)", strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </section>
              )}

              {/* Hydration Graph */}
              {nutritionGraphType === "hydration" && (
                <section className="rounded-[2rem] bg-surface-card p-5 border border-white/5 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-sm font-bold tracking-tight text-white uppercase font-display italic">
                        Hydration
                      </h3>
                      <p className="text-[9px] text-text-dim font-medium uppercase tracking-wider mt-0.5">
                        Water intake per day
                      </p>
                    </div>
                  </div>
                  <ChartContainer
                    className="h-[360px] w-full rounded-xl border border-white/5 bg-surface-card"
                    config={{ water: { label: "Water", color: "#06b6d4" } }}
                  >
                    <LineChart
                      accessibilityLayer
                      data={dataset}
                      margin={{ top: 12, left: 16, right: 16, bottom: 12 }}
                    >
                      <CartesianGrid strokeDasharray="6 6" stroke="rgba(255,255,255,0.1)" />
                      <XAxis
                        dataKey="dateLabel"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        tick={{ fill: "#9CA3AF", fontSize: 10, letterSpacing: 0.5 }}
                      />
                      <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Line
                        type="monotone"
                        dataKey="gr"
                        name="Water"
                        stroke="var(--color-water)"
                        strokeWidth={4}
                        dot={{ r: 4, fill: "var(--color-water)", strokeWidth: 0 }}
                        activeDot={{ r: 7, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </section>
              )}
            </div>
          )}

          {/* Workout Tab */}
          {activeTab === "workout" && (
            <div className="space-y-6">
              {/* Exercise Selection */}
              <div className="flex gap-2 flex-wrap">
                {workoutData.map((exercise) => (
                  <button
                    key={exercise.name}
                    onClick={() => setSelectedExercise(exercise.name)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all text-xs whitespace-nowrap ${
                      selectedExercise === exercise.name
                        ? "bg-primary text-white"
                        : "bg-surface-card border border-white/5 text-text-dim hover:border-white/10"
                    }`}
                  >
                    {exercise.name.substring(0, 20)}
                  </button>
                ))}
              </div>

              {/* Workout Graph */}
              {isLoadingWorkouts ? (
                <section className="rounded-[2rem] bg-surface-card p-5 border border-white/5 h-[360px] flex items-center justify-center">
                  <p className="text-text-dim">Loading workouts...</p>
                </section>
              ) : workoutData.length > 0 && selectedExercise ? (
                <section className="rounded-[2rem] bg-surface-card p-5 border border-white/5 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-sm font-bold tracking-tight text-white uppercase font-display italic">
                        {selectedExercise}
                      </h3>
                      <p className="text-[9px] text-text-dim font-medium uppercase tracking-wider mt-0.5">
                        Frequency and volume progress
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {workoutData.find((ex) => ex.name === selectedExercise) && (
                      <>
                        <div className="bg-surface-dark rounded-lg p-4 border border-white/5">
                          <p className="text-[9px] text-text-dim uppercase tracking-wider font-bold">Times Done</p>
                          <p className="text-2xl font-bold text-white mt-2">
                            {workoutData.find((ex) => ex.name === selectedExercise)?.count}
                          </p>
                        </div>
                        <div className="bg-surface-dark rounded-lg p-4 border border-white/5">
                          <p className="text-[9px] text-text-dim uppercase tracking-wider font-bold">Total Volume</p>
                          <p className="text-2xl font-bold text-white mt-2">
                            {Math.round(workoutData.find((ex) => ex.name === selectedExercise)?.volume || 0)} kg×reps
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <ChartContainer
                    className="h-[300px] w-full rounded-xl border border-white/5 bg-surface-card"
                    config={{
                      count: { label: "Times Done", color: "#f97316" },
                      volume: { label: "Volume", color: "#22c55e" },
                    }}
                  >
                    <LineChart
                      accessibilityLayer
                      data={[
                        {
                          name: "Summary",
                          count: workoutData.find((ex) => ex.name === selectedExercise)?.count || 0,
                          volume: workoutData.find((ex) => ex.name === selectedExercise)?.volume || 0,
                        },
                      ]}
                      margin={{ top: 12, left: 16, right: 16, bottom: 12 }}
                    >
                      <CartesianGrid strokeDasharray="6 6" stroke="rgba(255,255,255,0.1)" />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        tick={{ fill: "#9CA3AF", fontSize: 10 }}
                      />
                      <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Times"
                        stroke="var(--color-count)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "var(--color-count)", strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </section>
              ) : (
                <section className="rounded-[2rem] bg-surface-card p-5 border border-white/5 h-[360px] flex items-center justify-center">
                  <p className="text-text-dim">No workout data available for this period</p>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
