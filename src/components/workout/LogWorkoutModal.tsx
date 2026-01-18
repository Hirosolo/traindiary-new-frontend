"use client";

import { useState, useMemo } from "react";

export interface NewWorkoutSession {
  title: string;
  date: string;
  time: string;
  note?: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
  }[];
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
  image?: string;
}

interface SelectedExercise extends Exercise {
  sets: number;
  reps: number;
}

interface LogWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workout: NewWorkoutSession) => void;
}

// Mock exercise database - replace with API call later
const EXERCISE_DATABASE: Exercise[] = [
  {
    id: "ex1",
    name: "Incline Dumbbell Press",
    category: "Chest",
    description: "Primary compound movement for upper pectoral development.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBM-Jl5BpK35Y2oIgK9xHhNqwSNsvpIfPmZF4zp4Gr_ExrO8dYtFM9oWo1do-j_4ATVbdzEKy5bmv4Hm1A4GUAp7760Vd5-PUmY2XlJrV-BE8h8CVbmKBW1WRDMyPl0Bk08E6v3SNaDEoj3PAOMuT0L0c4sFWSmyZiB9uVCexHRY33lPpyf8EG_IJMjisUbKUxczlujByVKyLvjofaPfPJ-5Y6-7dTtwRvbm-M2R1P6JixJ5kkqa-HvApT9wIztshusf9FjqR05lMM",
  },
  {
    id: "ex2",
    name: "Barbell Overhead Press",
    category: "Shoulders",
    description: "Strict standing military press for boulder shoulders.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRAbu-gKrCPTz_sMcwsGWOEF2ogoE7wcDFjEzIU4-YWAVVOG3nB2qmJ2GbqEoA4G2DL6HWKcGfa55c-BPKK6BFjPI8q0999SJ2L72Qq_LBPQkE1NKmvDpra0U1bRx-896x0kMj9dD1cKftKkAKXZFwq345NVmgT3KXxCAvLUqxYMlteWXt_paa5tcuOyQyBG-MXB0pqUKbjPDdCYLQyJwhd4fmSkY1iaXwz3Ut9EZhh6rCRRET64FWENQABl3j3HQdpwskXWU3IKk",
  },
  {
    id: "ex3",
    name: "Lateral Raises",
    category: "Shoulders",
    description: "Isolation movement for lateral deltoid width.",
  },
  {
    id: "ex4",
    name: "Tricep Pushdowns",
    category: "Triceps",
    description: "Cable isolation for tricep lateral head.",
  },
  {
    id: "ex5",
    name: "Dips (Weighted)",
    category: "Chest",
    description: "Heavy compound for lower chest and triceps.",
  },
  {
    id: "ex6",
    name: "Bench Press",
    category: "Chest",
    description: "Classic compound movement for chest development.",
  },
  {
    id: "ex7",
    name: "Pull-ups",
    category: "Back",
    description: "Compound movement for back and biceps.",
  },
  {
    id: "ex8",
    name: "Barbell Squats",
    category: "Legs",
    description: "King of leg exercises for overall lower body.",
  },
];

const WORKOUT_TYPES = [
  { id: "push", name: "Push", icon: "fitness_center", description: "Chest, Shoulders, Triceps" },
  { id: "pull", name: "Pull", icon: "rowing", description: "Back, Biceps, Rear Delts" },
  { id: "legs", name: "Legs", icon: "foot_bones", description: "Quads, Hamstrings, Calves" },
  { id: "full", name: "Full Body", icon: "accessibility_new", description: "Total body conditioning" },
  { id: "upper", name: "Upper", icon: "vertical_align_top", description: "All upper body groups" },
  { id: "lower", name: "Lower", icon: "vertical_align_bottom", description: "All lower body groups" },
];

export default function LogWorkoutModal({
  isOpen,
  onClose,
  onSubmit,
}: LogWorkoutModalProps) {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [workoutType, setWorkoutType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);

  const filteredExercises = useMemo(() => {
    return EXERCISE_DATABASE.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "All" || ex.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(EXERCISE_DATABASE.map((ex) => ex.category));
    return ["All", ...Array.from(cats)];
  }, []);

  const toggleExerciseSelection = (exercise: Exercise) => {
    const isSelected = selectedExercises.some((ex) => ex.id === exercise.id);
    if (isSelected) {
      setSelectedExercises(selectedExercises.filter((ex) => ex.id !== exercise.id));
    } else {
      setSelectedExercises([...selectedExercises, { ...exercise, sets: 3, reps: 12 }]);
    }
  };

  const updateExerciseConfig = (id: string, field: "sets" | "reps", value: number) => {
    setSelectedExercises(
      selectedExercises.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  };

  const removeExercise = (id: string) => {
    setSelectedExercises(selectedExercises.filter((ex) => ex.id !== id));
  };

  const handleNext = () => {
    if (step === 1 && !workoutType) {
      alert("Please select a workout type");
      return;
    }
    if (step === 2 && selectedExercises.length === 0) {
      alert("Please select at least one exercise");
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    const selectedType = WORKOUT_TYPES.find((t) => t.id === workoutType);

    onSubmit({
      title: selectedType?.name || "Workout",
      date,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      exercises: selectedExercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
      })),
    });

    // Reset form
    setStep(1);
    setDate(new Date().toISOString().split("T")[0]);
    setWorkoutType("");
    setSelectedExercises([]);
    setSearchQuery("");
    setCategoryFilter("All");
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const totalSets = selectedExercises.reduce((sum, ex) => sum + ex.sets, 0);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface-dark border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div>
              <h2 className="text-xl lg:text-2xl font-display font-bold uppercase tracking-tight">
                New Session
              </h2>
              <p className="text-text-dim text-[10px] mt-1 uppercase tracking-widest font-semibold">
                Step {step < 10 ? `0${step}` : step}:{" "}
                {step === 1 ? "Schedule & Type" : step === 2 ? "Select Exercises" : "Finalize Plan"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-full bg-surface-card border border-white/10 hover:bg-surface-highlight transition-colors"
            >
              <span className="material-symbols-outlined text-lg lg:text-xl">close</span>
            </button>
          </div>
          {/* Step Indicators */}
          <div className="flex gap-2">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-white/10"}`}></div>
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-white/10"}`}></div>
            <div className={`h-1 flex-1 rounded-full ${step >= 3 ? "bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-white/10"}`}></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Step 1: Date & Type */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em] mb-4">
                  Select Date
                </h3>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-surface-card border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em] mb-4">
                  Workout Type
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {WORKOUT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setWorkoutType(type.id)}
                      className={`bg-surface-card border rounded-2xl p-4 text-left relative overflow-hidden group transition-colors ${
                        workoutType === type.id
                          ? "border-primary/40"
                          : "border-white/5 hover:border-white/20"
                      }`}
                    >
                      {workoutType === type.id && (
                        <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-2xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm text-primary">
                            check_circle
                          </span>
                        </div>
                      )}
                      <span
                        className={`material-symbols-outlined mb-2 ${
                          workoutType === type.id ? "text-primary" : "text-text-dim"
                        }`}
                      >
                        {type.icon}
                      </span>
                      <p className="font-display font-bold text-sm uppercase tracking-tight">
                        {type.name}
                      </p>
                      <p className="text-[10px] text-text-dim">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Exercises */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-card border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-text-dim/50"
                    placeholder="Search exercises..."
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        categoryFilter === cat
                          ? "bg-primary/10 border border-primary/20 text-primary"
                          : "bg-surface-card border border-white/5 text-text-dim"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredExercises.map((exercise) => {
                  const isSelected = selectedExercises.some((ex) => ex.id === exercise.id);
                  return (
                    <div
                      key={exercise.id}
                      className={`bg-surface-card border rounded-2xl p-4 flex items-center gap-4 group transition-colors ${
                        isSelected ? "border-primary/30" : "border-white/5"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-12 h-12 bg-primary/10 -mr-6 -mt-6 rounded-full blur-xl"></div>
                      )}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-highlight flex-shrink-0">
                        {exercise.image ? (
                          <img
                            alt={exercise.name}
                            className={`w-full h-full object-cover transition-opacity ${
                              isSelected ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                            }`}
                            src={exercise.image}
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                            <span className="material-symbols-outlined text-zinc-600">
                              fitness_center
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-display font-bold text-sm uppercase tracking-tight truncate">
                            {exercise.name}
                          </h4>
                          <span className="flex-shrink-0 px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary text-[8px] font-bold uppercase">
                            {exercise.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-dim leading-tight line-clamp-1">
                          {exercise.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleExerciseSelection(exercise)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                            : "bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {isSelected ? "check" : "add"}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Configure Sets/Reps */}
          {step === 3 && (
            <div>
              <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em] mb-4">
                Selected Exercises
              </h3>
              <div className="space-y-3">
                {selectedExercises.map((exercise) => (
                  <div key={exercise.id} className="bg-surface-card border border-white/5 rounded-2xl p-4">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-highlight flex-shrink-0">
                        {exercise.image ? (
                          <img
                            alt={exercise.name}
                            className="w-full h-full object-cover"
                            src={exercise.image}
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                            <span className="material-symbols-outlined text-zinc-600">
                              fitness_center
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-display font-bold text-sm uppercase tracking-tight truncate">
                            {exercise.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeExercise(exercise.id)}
                            className="text-text-dim hover:text-red-400 transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                        <span className="inline-block px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary text-[8px] font-bold uppercase mt-1">
                          {exercise.category}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background-dark/50 rounded-xl p-3 border border-white/5">
                        <label className="block text-[9px] font-bold text-text-dim uppercase tracking-wider mb-2">
                          Sets
                        </label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) =>
                              updateExerciseConfig(exercise.id, "sets", parseInt(e.target.value) || 3)
                            }
                            min="1"
                            max="10"
                            className="w-full bg-transparent border-none p-0 text-xl font-display font-bold focus:ring-0"
                          />
                          <span className="text-[10px] font-bold text-text-dim">x</span>
                        </div>
                      </div>
                      <div className="bg-background-dark/50 rounded-xl p-3 border border-white/5">
                        <label className="block text-[9px] font-bold text-text-dim uppercase tracking-wider mb-2">
                          Reps
                        </label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={exercise.reps}
                            onChange={(e) =>
                              updateExerciseConfig(exercise.id, "reps", parseInt(e.target.value) || 12)
                            }
                            min="1"
                            max="50"
                            className="w-full bg-transparent border-none p-0 text-xl font-display font-bold focus:ring-0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 lg:p-6 border-t border-white/5">
          {step === 2 && (
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[9px] font-bold text-text-dim uppercase tracking-[0.2em] block mb-0.5">
                  Selections
                </span>
                <p className="text-sm font-display font-bold">
                  {selectedExercises.length} Exercise{selectedExercises.length !== 1 ? "s" : ""} Selected
                </p>
              </div>
              {selectedExercises.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedExercises([])}
                  className="text-xs font-bold text-primary uppercase tracking-widest hover:text-primary/80 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="flex items-center justify-between mb-4 px-1">
              <div>
                <span className="text-[9px] font-bold text-text-dim uppercase tracking-[0.2em] block mb-0.5">
                  Session Overview
                </span>
                <p className="text-sm font-display font-bold">
                  {selectedExercises.length} Exercise{selectedExercises.length !== 1 ? "s" : ""} • {totalSets} Sets Total
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className={`${
                  step === 3 ? "flex-[0.3]" : "flex-[0.4]"
                } bg-surface-highlight text-white font-bold py-3 lg:py-4 rounded-xl uppercase tracking-widest text-[10px] lg:text-[11px] border border-white/5 flex items-center justify-center hover:bg-surface-card transition-colors`}
              >
                {step === 3 ? (
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                ) : (
                  "Back"
                )}
              </button>
            )}
            <button
              type="button"
              onClick={step === 3 ? handleSubmit : handleNext}
              className="flex-1 bg-primary text-white font-bold py-3 lg:py-4 rounded-xl shadow-[0_8px_30px_rgba(59,130,246,0.3)] uppercase tracking-widest text-[10px] lg:text-[11px] flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            >
              {step === 3 ? (
                <span className="hidden sm:inline">CONFIRM & CREATE SESSION</span>
              ) : (
                <>
                  Continue <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
              {step === 3 && (
                <span className="sm:hidden">CREATE SESSION</span>
              )}
            </button>
          </div>
          <div className="h-1.5 w-32 bg-white/10 rounded-full mx-auto mt-4 lg:mt-6"></div>
        </div>
      </div>
    </div>
  );
}
