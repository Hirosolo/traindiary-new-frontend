"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { eachMonthOfInterval, eachYearOfInterval, endOfYear, format, startOfYear } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar as BaseCalendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";

type CalendarStep = "year" | "month" | "day";

type CalendarLumeProps = {
  onMonthYearChange?: (year: number, monthIndex: number) => void;
  onClose?: () => void;
  defaultYear?: number;
  defaultMonth?: number;
  initialStep?: CalendarStep;
};

function CalendarLume({ onMonthYearChange, onClose, defaultYear, defaultMonth, initialStep = "year" }: CalendarLumeProps) {
  const today = new Date();
  const [step, setStep] = useState<CalendarStep>(initialStep);
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear ?? today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth ?? today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(selectedYear, selectedMonth, 1));

  // Only call callback when user completes month selection (not on every state change)

  const yearRange = eachYearOfInterval({
    start: startOfYear(new Date(1900, 0, 1)),
    end: endOfYear(new Date(2100, 11, 31)),
  });

  return (
    <div className="rounded-xl bg-black/95 w-full max-w-md border border-border/60 p-4">
      {/* Header */}
      <div className="flex flex-col items-start gap-3 mb-6">
        <div className="flex w-full items-start justify-between gap-3">
          <h2 className="text-lg font-display font-bold text-white uppercase tracking-tight">
            {step === "year" && "Select a Year"}
            {step === "month" && `Year ${selectedYear}`}
            {step === "day" && format(selectedDate ?? today, "MMMM yyyy")}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        {/* Breadcrumb buttons */}
        <div className="flex gap-2">
          <Button variant={step === "year" ? "default" : "outline"} size="sm" onClick={() => setStep("year")}>
            Year
          </Button>
          <Button
            variant={step === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setStep("month")}
            disabled={step === "year"}
          >
            Month
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "year" && (
          <motion.div
            key="year"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-80"
          >
            <ScrollArea className="h-full">
              <div className="grid grid-cols-4 gap-2">
                {yearRange.map((year) => (
                  <Button
                    key={year.getFullYear()}
                    variant={year.getFullYear() === selectedYear ? "default" : "outline"}
                    size="sm"
                    className="h-10"
                    onClick={() => {
                      setSelectedYear(year.getFullYear());
                      setStep("month");
                    }}
                  >
                    {year.getFullYear()}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}

        {step === "month" && (
          <motion.div
            key="month"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-3 gap-2"
          >
            {eachMonthOfInterval({
              start: startOfYear(new Date(selectedYear, 0, 1)),
              end: endOfYear(new Date(selectedYear, 11, 31)),
            }).map((month) => (
              <Button
                key={month.toISOString()}
                variant={month.getMonth() === selectedMonth ? "default" : "outline"}
                size="sm"
                className="h-12 flex items-center justify-center"
                onClick={() => {
                  setSelectedMonth(month.getMonth());
                  setSelectedDate(new Date(selectedYear, month.getMonth(), 1));
                  // Only close and call callback when month is actually selected
                  onMonthYearChange?.(selectedYear, month.getMonth());
                  onClose?.();
                }}
              >
                <span className="text-sm font-medium">{format(month, "MMM")}</span>
              </Button>
            ))}
          </motion.div>
        )}

        {step === "day" && (
          <motion.div
            key="day"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <BaseCalendar
              mode="single"
              month={new Date(selectedYear, selectedMonth, 1)}
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date)}
              onMonthChange={(date) => {
                setSelectedYear(date.getFullYear());
                setSelectedMonth(date.getMonth());
              }}
              className="rounded-lg border border-border bg-card mx-auto"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { CalendarLume };
