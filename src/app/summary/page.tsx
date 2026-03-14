"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/line-chart";
import { CalendarLume } from "@/components/ui/calendar-lume";
import NavBar from "@/components/ui/navbar";
import { CircularProgress } from "@/components/ui/circular-progress";
import { fetchSummary } from "@/lib/api/workouts";

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




export default function SummaryPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarStep, setCalendarStep] = useState<"year" | "month">("year");
  const [dataset, setDataset] = useState<SummaryPoint[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch summary data
  const loadSummaryData = useCallback(async (forceRefresh = false) => {
    setIsLoadingSummary(true);
    try {
      const monthParam = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
      const data = await fetchSummary(monthParam, forceRefresh);
      
      if (data) {
        // Build Daily Dataset for the chart
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const newDataset: SummaryPoint[] = [];

        for (let i = 1; i <= daysInMonth; i++) {
          const dayStr = String(i).padStart(2, "0");
          const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${dayStr}`;
          const dayDate = new Date(selectedYear, selectedMonth, i);
          
          const serverDay = (data.daily_data || []).find((d: any) => d.date === dateStr);

          newDataset.push({
            label: dayStr,
            dateLabel: formatDateLabel(dayDate),
            workouts: serverDay?.workouts || 0,
            kcal: Math.round(serverDay?.kcal || 0),
            protein: Math.round(serverDay?.protein || 0),
            carbs: Math.round(serverDay?.carbs || 0),
            fats: Math.round(serverDay?.fats || 0),
            fiber: Math.round(serverDay?.fiber || 0),
            sugar: Math.round(serverDay?.sugar || 0),
            gr: serverDay?.gr || 0,
          });
        }
        setDataset(newDataset);
      }
    } catch (error) {
      console.error("Failed to load summary data:", error);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [selectedMonth, selectedYear]);
  
  // Fetch summary data on mount and dependencies change
  useEffect(() => {
    loadSummaryData();
  }, [loadSummaryData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadSummaryData(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMonthYearChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setIsCalendarOpen(false);
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const totals = useMemo(() => {
    const totalDays = dataset.length || 1;
    const totalWorkouts = dataset.reduce((sum, d) => sum + d.workouts, 0);
    const avgKcal = Math.round(dataset.reduce((sum, d) => sum + d.kcal, 0) / totalDays);
    const avgProtein = Math.round(dataset.reduce((sum, d) => sum + d.protein, 0) / totalDays);
    
    // Average GR score only over days when a workout occurred
    const workoutDays = dataset.filter(d => d.workouts > 0);
    const avgGR = workoutDays.length > 0 
      ? Math.round(workoutDays.reduce((sum, d) => sum + d.gr, 0) / workoutDays.length)
      : 0;

    return { totalWorkouts, avgKcal, avgProtein, avgGR };
  }, [dataset]);

  return (
    <div className="bg-background-dark text-white min-h-screen">
      <NavBar className="hidden lg:block" />

      <main className="pt-16 pb-24 overflow-y-auto">
        <div className="p-5 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-display tracking-tight text-white uppercase italic leading-tight">
                Summary
              </h1>
              <p className="text-[11px] text-text-dim mt-0.5 font-medium leading-relaxed">
                Monthly performance snapshot.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
              aria-label="Refresh summary data"
            >
              <span className={`material-symbols-outlined text-lg ${isRefreshing ? "animate-spin" : ""}`}>refresh</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Month/Year Selector */}
            <div className="relative w-full max-w-xs">
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

        {/* Charts View */}
        <div className="px-5 mt-8">
            <div className="space-y-6">
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
            </div>
        </div>
      </main>

    </div>
  );
}
