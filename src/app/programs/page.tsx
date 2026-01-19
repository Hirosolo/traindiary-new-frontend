"use client";

import { useState } from "react";
import NavBar from "@/components/ui/navbar";

type Program = {
  id: string;
  title: string;
  category: "all" | "hypertrophy" | "strength" | "cutting";
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: number;
  frequency: number;
  description: string;
  image: string;
  intensity: "Low" | "Moderate" | "High";
  weeks: {
    title: string;
    days: {
      name: string;
      label: string;
      type: "workout" | "rest";
      exercises: Array<{
        name: string;
        category: string;
        sets: string;
      }>;
    }[];
  }[];
};

const mockPrograms: Program[] = [
  {
    id: "p1",
    title: "The Aesthetic Blueprint",
    category: "hypertrophy",
    level: "Advanced",
    duration: 12,
    frequency: 6,
    description: "A 12-week high-volume hypertrophy program designed for maximum muscle growth and symmetry.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBM-Jl5BpK35Y2oIgK9xHhNqwSNsvpIfPmZF4zp4Gr_ExrO8dYtFM9oWo1do-j_4ATVbdzEKy5bmv4Hm1A4GUAp7760Vd5-PUmY2XlJrV-BE8h8CVbmKBW1WRDMyPl0Bk08E6v3SNaDEoj3PAOMuT0L0c4sFWSmyZiB9uVCexHRY33lPpyf8EG_IJMjisUbKUxczlujByVKyLvjofaPfPJ-5Y6-7dTtwRvbm-M2R1P6JixJ5kkqa-HvApT9wIztshusf9FjqR05lMM",
    intensity: "High",
    weeks: [
      {
        title: "Week 1-4",
        days: [
          {
            name: "Day 01",
            label: "Push A",
            type: "workout",
            exercises: [
              { name: "Incline Bench Press", category: "Compound", sets: "4 × 8-10" },
              { name: "Lateral Raises", category: "Accessory", sets: "4 × 15-20" },
              { name: "Tricep Pushdowns", category: "Accessory", sets: "3 × 12-15" },
            ],
          },
          {
            name: "Day 02",
            label: "Pull A",
            type: "workout",
            exercises: [
              { name: "Deadlifts", category: "Compound", sets: "3 × 5" },
              { name: "Weighted Pullups", category: "Accessory", sets: "3 × 8-10" },
            ],
          },
          {
            name: "Day 03",
            label: "Rest Day",
            type: "rest",
            exercises: [],
          },
        ],
      },
      {
        title: "Week 5-8",
        days: [
          {
            name: "Day 01",
            label: "Push B",
            type: "workout",
            exercises: [
              { name: "Flat Bench Press", category: "Compound", sets: "4 × 6-8" },
              { name: "Incline Flyes", category: "Accessory", sets: "3 × 12-15" },
            ],
          },
        ],
      },
      {
        title: "Week 9-12",
        days: [
          {
            name: "Day 01",
            label: "Peak Week",
            type: "workout",
            exercises: [
              { name: "Competition Lifts", category: "Compound", sets: "3 × 3-5" },
              { name: "Volume Accessories", category: "Accessory", sets: "4 × 10-12" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "p2",
    title: "Absolute Strength",
    category: "strength",
    level: "Intermediate",
    duration: 8,
    frequency: 4,
    description: "An 8-week strength-focused program emphasizing powerlifting movements and neural adaptation.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRAbu-gKrCPTz_sMcwsGWOEF2ogoE7wcDFjEzIU4-YWAVVOG3nB2qmJ2GbqEoA4G2DL6HWKcGfa55c-BPKK6BFjPI8q0999SJ2L72Qq_LBPQkE1NKmvDpra0U1bRx-896x0kMj9dD1cKftKkAKXZFwq345NVmgT3KXxCAvLUqxYMlteWXt_paa5tcuOyQyBG-MXB0pqUKbjPDdCYLQyJwhd4fmSkY1iaXwz3Ut9EZhh6rCRRET64FWENQABl3j3HQdpwskXWU3IKk",
    intensity: "High",
    weeks: [
      {
        title: "Week 1-4",
        days: [
          {
            name: "Day 01",
            label: "Squat Day",
            type: "workout",
            exercises: [
              { name: "Back Squat", category: "Compound", sets: "5 × 3" },
              { name: "Front Squat", category: "Compound", sets: "3 × 5" },
              { name: "Leg Press", category: "Accessory", sets: "3 × 8" },
              { name: "Leg Curls", category: "Accessory", sets: "3 × 10" },
            ],
          },
          {
            name: "Day 02",
            label: "Bench Day",
            type: "workout",
            exercises: [
              { name: "Bench Press", category: "Compound", sets: "5 × 3" },
              { name: "Close-Grip Bench", category: "Compound", sets: "3 × 5" },
              { name: "Barbell Rows", category: "Accessory", sets: "3 × 5" },
              { name: "Face Pulls", category: "Accessory", sets: "3 × 15" },
            ],
          },
          {
            name: "Day 03",
            label: "Rest Day",
            type: "rest",
            exercises: [],
          },
          {
            name: "Day 04",
            label: "Deadlift Day",
            type: "workout",
            exercises: [
              { name: "Conventional Deadlift", category: "Compound", sets: "5 × 3" },
              { name: "Romanian Deadlift", category: "Compound", sets: "3 × 6" },
              { name: "Pull-ups", category: "Accessory", sets: "3 × 8" },
            ],
          },
          {
            name: "Day 05",
            label: "Overhead Press",
            type: "workout",
            exercises: [
              { name: "Overhead Press", category: "Compound", sets: "5 × 5" },
              { name: "Dips", category: "Compound", sets: "3 × 8" },
              { name: "Lateral Raises", category: "Accessory", sets: "3 × 12" },
            ],
          },
        ],
      },
      {
        title: "Week 5-8",
        days: [
          {
            name: "Day 01",
            label: "Max Effort Squat",
            type: "workout",
            exercises: [
              { name: "Back Squat", category: "Compound", sets: "3 × 2" },
              { name: "Pause Squat", category: "Compound", sets: "3 × 3" },
              { name: "Bulgarian Split Squat", category: "Accessory", sets: "3 × 8" },
            ],
          },
          {
            name: "Day 02",
            label: "Max Effort Bench",
            type: "workout",
            exercises: [
              { name: "Bench Press", category: "Compound", sets: "3 × 2" },
              { name: "Incline Bench", category: "Compound", sets: "3 × 5" },
              { name: "Weighted Dips", category: "Accessory", sets: "3 × 6" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "p3",
    title: "Lean Shred Protocol",
    category: "cutting",
    level: "Intermediate",
    duration: 6,
    frequency: 5,
    description: "A 6-week fat loss program combining moderate volume training with metabolic conditioning to preserve muscle while cutting.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBM-Jl5BpK35Y2oIgK9xHhNqwSNsvpIfPmZF4zp4Gr_ExrO8dYtFM9oWo1do-j_4ATVbdzEKy5bmv4Hm1A4GUAp7760Vd5-PUmY2XlJrV-BE8h8CVbmKBW1WRDMyPl0Bk08E6v3SNaDEoj3PAOMuT0L0c4sFWSmyZiB9uVCexHRY33lPpyf8EG_IJMjisUbKUxczlujByVKyLvjofaPfPJ-5Y6-7dTtwRvbm-M2R1P6JixJ5kkqa-HvApT9wIztshusf9FjqR05lMM",
    intensity: "Moderate",
    weeks: [
      {
        title: "Week 1-3",
        days: [
          {
            name: "Day 01",
            label: "Upper Power",
            type: "workout",
            exercises: [
              { name: "Bench Press", category: "Compound", sets: "4 × 6" },
              { name: "Barbell Rows", category: "Compound", sets: "4 × 6" },
              { name: "Overhead Press", category: "Compound", sets: "3 × 8" },
              { name: "Chin-ups", category: "Accessory", sets: "3 × 8" },
            ],
          },
          {
            name: "Day 02",
            label: "Lower Power",
            type: "workout",
            exercises: [
              { name: "Back Squat", category: "Compound", sets: "4 × 6" },
              { name: "Romanian Deadlift", category: "Compound", sets: "3 × 8" },
              { name: "Leg Press", category: "Accessory", sets: "3 × 10" },
              { name: "Leg Curls", category: "Accessory", sets: "3 × 12" },
            ],
          },
          {
            name: "Day 03",
            label: "Cardio & Core",
            type: "workout",
            exercises: [
              { name: "HIIT Intervals", category: "Cardio", sets: "20 min" },
              { name: "Planks", category: "Core", sets: "3 × 60s" },
              { name: "Hanging Leg Raises", category: "Core", sets: "3 × 12" },
            ],
          },
          {
            name: "Day 04",
            label: "Rest Day",
            type: "rest",
            exercises: [],
          },
          {
            name: "Day 05",
            label: "Upper Hypertrophy",
            type: "workout",
            exercises: [
              { name: "Incline Dumbbell Press", category: "Compound", sets: "3 × 10" },
              { name: "Cable Rows", category: "Compound", sets: "3 × 12" },
              { name: "Lateral Raises", category: "Accessory", sets: "3 × 15" },
              { name: "Tricep Pushdowns", category: "Accessory", sets: "3 × 15" },
              { name: "Bicep Curls", category: "Accessory", sets: "3 × 12" },
            ],
          },
          {
            name: "Day 06",
            label: "Lower Hypertrophy",
            type: "workout",
            exercises: [
              { name: "Front Squat", category: "Compound", sets: "3 × 10" },
              { name: "Leg Press", category: "Compound", sets: "3 × 12" },
              { name: "Walking Lunges", category: "Accessory", sets: "3 × 12" },
              { name: "Calf Raises", category: "Accessory", sets: "4 × 15" },
            ],
          },
        ],
      },
      {
        title: "Week 4-6",
        days: [
          {
            name: "Day 01",
            label: "Full Body Circuit",
            type: "workout",
            exercises: [
              { name: "Squat to Press", category: "Compound", sets: "3 × 12" },
              { name: "Kettlebell Swings", category: "Compound", sets: "3 × 15" },
              { name: "Push-ups", category: "Compound", sets: "3 × 20" },
              { name: "Box Jumps", category: "Cardio", sets: "3 × 10" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "p4",
    title: "Full Body Foundation",
    category: "hypertrophy",
    level: "Beginner",
    duration: 8,
    frequency: 3,
    description: "A beginner-friendly 8-week program focusing on compound movements and building a solid foundation of strength and muscle.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRAbu-gKrCPTz_sMcwsGWOEF2ogoE7wcDFjEzIU4-YWAVVOG3nB2qmJ2GbqEoA4G2DL6HWKcGfa55c-BPKK6BFjPI8q0999SJ2L72Qq_LBPQkE1NKmvDpra0U1bRx-896x0kMj9dD1cKftKkAKXZFwq345NVmgT3KXxCAvLUqxYMlteWXt_paa5tcuOyQyBG-MXB0pqUKbjPDdCYLQyJwhd4fmSkY1iaXwz3Ut9EZhh6rCRRET64FWENQABl3j3HQdpwskXWU3IKk",
    intensity: "Moderate",
    weeks: [
      {
        title: "Week 1-4",
        days: [
          {
            name: "Day 01",
            label: "Full Body A",
            type: "workout",
            exercises: [
              { name: "Goblet Squat", category: "Compound", sets: "3 × 10" },
              { name: "Bench Press", category: "Compound", sets: "3 × 8" },
              { name: "Lat Pulldown", category: "Compound", sets: "3 × 10" },
              { name: "Plank", category: "Core", sets: "3 × 30s" },
            ],
          },
          {
            name: "Day 02",
            label: "Rest Day",
            type: "rest",
            exercises: [],
          },
          {
            name: "Day 03",
            label: "Full Body B",
            type: "workout",
            exercises: [
              { name: "Romanian Deadlift", category: "Compound", sets: "3 × 10" },
              { name: "Overhead Press", category: "Compound", sets: "3 × 8" },
              { name: "Cable Row", category: "Compound", sets: "3 × 10" },
              { name: "Bicycle Crunches", category: "Core", sets: "3 × 15" },
            ],
          },
          {
            name: "Day 04",
            label: "Rest Day",
            type: "rest",
            exercises: [],
          },
          {
            name: "Day 05",
            label: "Full Body C",
            type: "workout",
            exercises: [
              { name: "Leg Press", category: "Compound", sets: "3 × 12" },
              { name: "Incline Dumbbell Press", category: "Compound", sets: "3 × 10" },
              { name: "Assisted Pull-ups", category: "Compound", sets: "3 × 8" },
              { name: "Russian Twists", category: "Core", sets: "3 × 20" },
            ],
          },
        ],
      },
      {
        title: "Week 5-8",
        days: [
          {
            name: "Day 01",
            label: "Full Body A+",
            type: "workout",
            exercises: [
              { name: "Back Squat", category: "Compound", sets: "4 × 8" },
              { name: "Bench Press", category: "Compound", sets: "4 × 8" },
              { name: "Barbell Rows", category: "Compound", sets: "3 × 10" },
              { name: "Leg Raises", category: "Core", sets: "3 × 12" },
            ],
          },
          {
            name: "Day 02",
            label: "Active Recovery",
            type: "rest",
            exercises: [],
          },
          {
            name: "Day 03",
            label: "Full Body B+",
            type: "workout",
            exercises: [
              { name: "Deadlift", category: "Compound", sets: "4 × 6" },
              { name: "Overhead Press", category: "Compound", sets: "4 × 8" },
              { name: "Lat Pulldown", category: "Compound", sets: "3 × 12" },
              { name: "Plank Variations", category: "Core", sets: "3 × 45s" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "p5",
    title: "Upper Lower Split",
    category: "hypertrophy",
    level: "Intermediate",
    duration: 10,
    frequency: 4,
    description: "A classic upper/lower split program for balanced muscle development. Train each body part twice per week with optimal volume.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBM-Jl5BpK35Y2oIgK9xHhNqwSNsvpIfPmZF4zp4Gr_ExrO8dYtFM9oWo1do-j_4ATVbdzEKy5bmv4Hm1A4GUAp7760Vd5-PUmY2XlJrV-BE8h8CVbmKBW1WRDMyPl0Bk08E6v3SNaDEoj3PAOMuT0L0c4sFWSmyZiB9uVCexHRY33lPpyf8EG_IJMjisUbKUxczlujByVKyLvjofaPfPJ-5Y6-7dTtwRvbm-M2R1P6JixJ5kkqa-HvApT9wIztshusf9FjqR05lMM",
    intensity: "Moderate",
    weeks: [
      {
        title: "Week 1-5",
        days: [
          {
            name: "Day 01",
            label: "Upper A",
            type: "workout",
            exercises: [
              { name: "Flat Bench Press", category: "Compound", sets: "4 × 8" },
              { name: "Barbell Rows", category: "Compound", sets: "4 × 8" },
              { name: "Incline Dumbbell Press", category: "Accessory", sets: "3 × 10" },
              { name: "Face Pulls", category: "Accessory", sets: "3 × 15" },
              { name: "Overhead Tricep Extension", category: "Accessory", sets: "3 × 12" },
              { name: "Hammer Curls", category: "Accessory", sets: "3 × 12" },
            ],
          },
          {
            name: "Day 02",
            label: "Lower A",
            type: "workout",
            exercises: [
              { name: "Back Squat", category: "Compound", sets: "4 × 8" },
              { name: "Romanian Deadlift", category: "Compound", sets: "3 × 10" },
              { name: "Leg Press", category: "Accessory", sets: "3 × 12" },
              { name: "Leg Curls", category: "Accessory", sets: "3 × 12" },
              { name: "Calf Raises", category: "Accessory", sets: "4 × 15" },
            ],
          },
          {
            name: "Day 03",
            label: "Rest Day",
            type: "rest",
            exercises: [],
          },
          {
            name: "Day 04",
            label: "Upper B",
            type: "workout",
            exercises: [
              { name: "Overhead Press", category: "Compound", sets: "4 × 8" },
              { name: "Pull-ups", category: "Compound", sets: "3 × 8" },
              { name: "Dumbbell Bench Press", category: "Accessory", sets: "3 × 10" },
              { name: "Cable Rows", category: "Accessory", sets: "3 × 12" },
              { name: "Lateral Raises", category: "Accessory", sets: "3 × 15" },
              { name: "Bicep Curls", category: "Accessory", sets: "3 × 12" },
            ],
          },
          {
            name: "Day 05",
            label: "Lower B",
            type: "workout",
            exercises: [
              { name: "Front Squat", category: "Compound", sets: "4 × 8" },
              { name: "Bulgarian Split Squat", category: "Compound", sets: "3 × 10" },
              { name: "Leg Extensions", category: "Accessory", sets: "3 × 12" },
              { name: "Seated Leg Curls", category: "Accessory", sets: "3 × 12" },
              { name: "Seated Calf Raises", category: "Accessory", sets: "4 × 15" },
            ],
          },
        ],
      },
      {
        title: "Week 6-10",
        days: [
          {
            name: "Day 01",
            label: "Upper Power",
            type: "workout",
            exercises: [
              { name: "Bench Press", category: "Compound", sets: "5 × 5" },
              { name: "Pendlay Rows", category: "Compound", sets: "5 × 5" },
              { name: "Close-Grip Bench", category: "Accessory", sets: "3 × 8" },
              { name: "Rear Delt Flyes", category: "Accessory", sets: "3 × 15" },
            ],
          },
          {
            name: "Day 02",
            label: "Lower Power",
            type: "workout",
            exercises: [
              { name: "Back Squat", category: "Compound", sets: "5 × 5" },
              { name: "Conventional Deadlift", category: "Compound", sets: "3 × 5" },
              { name: "Walking Lunges", category: "Accessory", sets: "3 × 12" },
              { name: "Standing Calf Raises", category: "Accessory", sets: "4 × 12" },
            ],
          },
        ],
      },
    ],
  },
];

const categories = [
  { id: "all", label: "All" },
  { id: "hypertrophy", label: "Hypertrophy" },
  { id: "strength", label: "Strength" },
  { id: "cutting", label: "Cutting" },
];

export default function ProgramsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredPrograms = mockPrograms.filter(
    (p) => selectedCategory === "all" || p.category === selectedCategory
  );

  const currentWeek = selectedProgram?.weeks[selectedWeekIndex];

  const handleProgramClick = (program: Program) => {
    setSelectedProgram(program);
    setSelectedWeekIndex(0);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-background-dark text-white min-h-screen">
      <NavBar className="hidden lg:block" />

      <main className="pt-16 pb-32">
        {/* Header with Search */}
        <header className="top-16 z-40 glass-panel px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-display tracking-tight uppercase leading-none">
              Programs
            </h2>
            <p className="text-text-dim text-[10px] mt-0.5 uppercase tracking-widest font-semibold">
              Elite Performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-card border border-white/10 hover:bg-surface-highlight transition-colors">
              <span className="material-symbols-outlined text-xl">search</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center text-[10px] font-bold">
              DL
            </div>
          </div>
        </header>

        {/* Category Filter */}
        <div className="px-5 py-6 overflow-x-auto no-scrollbar flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
              }}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                selectedCategory === cat.id
                  ? "bg-primary text-white"
                  : "bg-surface-card border border-white/5 text-text-dim hover:border-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Program Cards */}
        <div className="px-5 space-y-4 mb-8">
          {filteredPrograms.map((program) => (
            <button
              key={program.id}
              onClick={() => handleProgramClick(program)}
              className="w-full bg-surface-card border border-white/5 rounded-2xl p-5 hover:border-primary/30 transition-colors text-left group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="mb-2">
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 text-[8px] font-bold uppercase tracking-widest">
                    {program.level}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-text-dim text-sm">calendar_today</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-white">
                      {program.duration} Weeks
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-text-dim text-sm">schedule</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-white">
                      {program.frequency} Days/Wk
                    </span>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold font-display leading-tight uppercase mb-2 group-hover:text-primary transition-colors">
                {program.title}
              </h3>
              <p className="text-sm text-text-dim leading-relaxed line-clamp-2">
                {program.description}
              </p>
            </button>
          ))}
        </div>

        {/* Program Details Modal */}
        {isModalOpen && selectedProgram && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end lg:items-center lg:justify-center">
            <div className="w-full lg:max-w-4xl bg-surface-dark rounded-t-3xl lg:rounded-3xl max-h-[90vh] overflow-y-auto flex flex-col animate-slide-up">
              {/* Modal Header */}
              <div className="sticky top-0 bg-surface-dark border-b border-white/5 px-6 py-4 flex items-center justify-between lg:rounded-t-3xl z-10">
                <h2 className="text-lg font-display font-bold uppercase">Program Details</h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-surface-card rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 px-6 py-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-primary font-bold uppercase tracking-[0.2em] text-[8px]">
                    Currently Viewing
                  </span>
                  <div className="h-px flex-1 bg-primary/20"></div>
                </div>
                <h2 className="text-3xl font-bold font-display uppercase tracking-tight mb-3">
                  {selectedProgram.title}
                </h2>
                <p className="text-text-dim text-sm leading-relaxed mb-6">
                  {selectedProgram.description}
                </p>

                {/* Program Stats */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-surface-highlight p-3 rounded-xl border border-white/5">
                    <p className="text-[8px] text-text-dim uppercase font-bold mb-1 tracking-widest">
                      Duration
                    </p>
                    <p className="font-display font-bold text-sm">{selectedProgram.duration} Weeks</p>
                  </div>
                  <div className="bg-surface-highlight p-3 rounded-xl border border-white/5">
                    <p className="text-[8px] text-text-dim uppercase font-bold mb-1 tracking-widest">
                      Intensity
                    </p>
                    <p className="font-display font-bold text-sm">{selectedProgram.intensity}</p>
                  </div>
                </div>

                <button className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-[0_8px_30px_rgba(59,130,246,0.3)] uppercase tracking-widest text-[12px] hover:brightness-110 transition-all mb-8">
                  Apply Program
                </button>

                {/* Week Tabs */}
                <div className="flex border-b border-white/5 mb-6 overflow-x-auto no-scrollbar">
                  {selectedProgram.weeks.map((week, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedWeekIndex(idx)}
                      className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                        selectedWeekIndex === idx
                          ? "border-b-2 border-primary text-white"
                          : "text-text-dim hover:text-white border-b-2 border-transparent"
                      }`}
                    >
                      {week.title}
                    </button>
                  ))}
                </div>

                {/* Week Content */}
                <div className="space-y-4">
                  {currentWeek?.days.map((day, idx) => (
                    <div
                      key={idx}
                      className={`rounded-2xl p-5 border transition-colors ${
                        day.type === "workout"
                          ? "bg-surface-highlight/40 border-white/5"
                          : "bg-surface-highlight/20 border-white/5 opacity-60"
                      }`}
                    >
                      {day.type === "workout" ? (
                        <>
                          <div className="flex justify-between items-center mb-5">
                            <h4 className="font-display font-bold text-lg uppercase tracking-tight text-white">
                              {day.name}
                            </h4>
                            <span className="text-[8px] font-bold text-primary uppercase bg-primary/10 px-2 py-1 rounded">
                              {day.label}
                            </span>
                          </div>
                          <div className="space-y-4">
                            {day.exercises.map((exercise, exIdx) => (
                              <div key={exIdx}>
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <h5 className="font-bold text-xs mb-0.5 text-white">
                                      {exercise.name}
                                    </h5>
                                    <p className="text-[10px] text-text-dim font-medium uppercase tracking-wider">
                                      {exercise.category}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-bold text-primary">
                                      {exercise.sets}
                                    </p>
                                  </div>
                                </div>
                                {exIdx < day.exercises.length - 1 && (
                                  <div className="h-px bg-white/5 my-4"></div>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-text-dim text-lg">
                              hotel
                            </span>
                            <h4 className="font-display font-bold text-sm uppercase tracking-tight text-text-dim">
                              {day.name}: {day.label}
                            </h4>
                          </div>
                          <span className="text-[8px] font-bold text-text-dim uppercase bg-white/5 px-2 py-1 rounded">
                            Recovery
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Start Button */}
                <div className="py-10">
                  <button className="w-full bg-white text-black font-bold py-5 rounded-xl uppercase tracking-[0.1em] text-[12px] shadow-xl hover:bg-zinc-100 transition-colors">
                    Apply Program &amp; Start
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
