"use client";

import { useMemo, useState } from "react";
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
  const dataset = useMemo(() => buildMonthlyData(selectedYear, selectedMonth), [selectedMonth, selectedYear]);

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
              className="w-full bg-surface-card border border-white/5 rounded-xl px-4 py-3 hover:border-white/10 transition-colors text-left"
            >
              <span className="text-[10px] uppercase tracking-[0.16em] text-text-dim font-bold block mb-1">
                Select Period
              </span>
              <p className="text-lg font-display font-bold text-white">
                {monthNames[selectedMonth]} {selectedYear}
              </p>
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

        {/* Charts */}
        <div className="px-5 mt-8 space-y-8">
          {/* Nutrition Trends Chart */}
          <section className="rounded-[2rem] bg-surface-card p-5 border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white uppercase font-display italic">
                  Nutrition Trends
                </h3>
                <p className="text-[9px] text-text-dim font-medium uppercase tracking-wider mt-0.5">
                  Calories & Protein per day
                </p>
              </div>
            </div>
            <ChartContainer
              className="h-[360px] w-full rounded-xl border border-white/5 bg-surface-card"
              config={{
                calories: { label: "Calories", color: "#3b82f6" },
                protein: { label: "Protein", color: "#a855f7" },
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
                  stroke="var(--color-calories)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--color-calories)", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="protein"
                  name="Protein"
                  stroke="var(--color-protein)"
                  strokeDasharray="6 6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--color-protein)", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ChartContainer>
          </section>

          {/* GR Progression Chart */}
          <section className="rounded-[2rem] bg-surface-card p-5 border border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white uppercase font-display italic">
                  GR Progression
                </h3>
                <p className="text-[9px] text-text-dim font-medium uppercase tracking-wider mt-0.5">
                  GR score per day
                </p>
              </div>
            </div>
            <ChartContainer
              className="h-[360px] w-full rounded-xl border border-white/5 bg-surface-card"
              config={{ gr: { label: "GR", color: "#22c55e" } }}
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
                  name="GR"
                  stroke="var(--color-gr)"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "var(--color-gr)", strokeWidth: 0 }}
                  activeDot={{ r: 7, strokeWidth: 0 }}
                />
              </LineChart>
            </ChartContainer>
          </section>
        </div>
      </main>
    </div>
  );
}
