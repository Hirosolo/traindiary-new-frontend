"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchExercises, fetchWorkoutTypes } from "@/lib/api/workouts";

export interface NewWorkoutSession {
  title: string;
  date: string;
  time: string;
  type: string;
  note?: string;
  exercises: {
    id: string | number;
    name: string;
    reps: { rep: number; weight_kg?: number | null }[];
  }[];
}

interface Exercise {
  id: string | number;
  name: string;
  category?: string;
  description?: string;
  image?: string;
}

interface SelectedExercise extends Exercise {
  reps: number[]; // per-set rep targets
}

interface LogWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workout: NewWorkoutSession) => Promise<void> | void;
}

const FALLBACK_EXERCISES: Exercise[] = [
  {
    id: "fallback-ex1",
    name: "Incline Dumbbell Press",
    category: "Chest",
    description: "Primary compound movement for upper pectoral development.",
  },
  {
    id: "fallback-ex2",
    name: "Barbell Overhead Press",
    category: "Shoulders",
    description: "Strict standing military press for boulder shoulders.",
  },
  {
    id: "fallback-ex3",
    name: "Lateral Raises",
    category: "Shoulders",
    description: "Isolation movement for lateral deltoid width.",
  },
  {
    id: "fallback-ex4",
    name: "Tricep Pushdowns",
    category: "Triceps",
    description: "Cable isolation for tricep lateral head.",
  },
];

const WORKOUT_TYPE_ICONS: Record<string, string> = {
  "Push": "fitness_center",
  "Pull": "rowing",
  "Legs": "foot_bones",
  "Full Body": "accessibility_new",
  "Upper": "vertical_align_top",
  "Lower": "vertical_align_bottom",
  "Upper Body": "vertical_align_top",
  "Lower Body": "vertical_align_bottom",
  "Cardio": "directions_run",
};

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
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [note, setNote] = useState<string>("");
  const [workoutTypes, setWorkoutTypes] = useState<string[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadExercises = async () => {
      setIsLoadingExercises(true);
      setLoadError(null);
      try {
        const exercises = await fetchExercises();
        const normalized = exercises.map((ex) => ({
          id: ex.exercise_id ?? ex.name,
          name: ex.name,
          category: ex.category,
          description: ex.description,
          image: ex.image,
        }));
        setAvailableExercises(normalized);
      } catch (error) {
        console.error("Failed to fetch exercises", error);
        setLoadError(error instanceof Error ? error.message : "Unable to load exercises");
        setAvailableExercises(FALLBACK_EXERCISES);
      } finally {
        setIsLoadingExercises(false);
      }
    };

    const loadWorkoutTypes = async () => {
      setIsLoadingTypes(true);
      try {
        const types = await fetchWorkoutTypes();
        setWorkoutTypes(types);
      } catch (error) {
        console.error("Failed to fetch workout types", error);
        setWorkoutTypes(["Push", "Pull", "Legs", "Cardio", "Full Body"]);
      } finally {
        setIsLoadingTypes(false);
      }
    };

    loadExercises();
    loadWorkoutTypes();
  }, [isOpen]);

  const filteredExercises = useMemo(() => {
    return availableExercises.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || (ex.category || "Uncategorized") === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [availableExercises, searchQuery, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(availableExercises.map((ex) => ex.category || "Uncategorized"));
    return ["All", ...Array.from(cats)];
  }, [availableExercises]);

  const toggleExerciseSelection = (exercise: Exercise) => {
    const isSelected = selectedExercises.some((ex) => ex.id === exercise.id);
    if (isSelected) {
      setSelectedExercises(selectedExercises.filter((ex) => ex.id !== exercise.id));
    } else {
      setSelectedExercises([
        ...selectedExercises,
        { ...exercise, reps: [12, 12, 12] },
      ]);
    }
  };

  const updateExerciseRepRow = (id: string | number, index: number, value: number) => {
    setSelectedExercises((prev) =>
      prev.map((ex) =>
        ex.id === id
          ? {
              ...ex,
              reps: ex.reps.map((repVal, i) => (i === index ? (value > 0 ? value : 1) : repVal)),
            }
          : ex
      )
    );
  };

  const addExerciseRepRow = (id: string | number) => {
    setSelectedExercises((prev) =>
      prev.map((ex) =>
        ex.id === id
          ? {
              ...ex,
              reps: [...ex.reps, ex.reps[ex.reps.length - 1] ?? 10],
            }
          : ex
      )
    );
  };

  const removeExerciseRepRow = (id: string | number, index: number) => {
    setSelectedExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== id) return ex;
        const next = ex.reps.filter((_, i) => i !== index);
        return { ...ex, reps: next.length > 0 ? next : [10] };
      })
    );
  };

  const removeExercise = (id: string | number) => {
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

  const handleSubmit = async () => {
    if (selectedExercises.length === 0) {
      alert("Please select at least one exercise");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: workoutType || "Workout",
        date,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        type: workoutType || "Workout",
        note: note || undefined,
        exercises: selectedExercises.map((ex) => ({
          id: ex.id,
          name: ex.name,
          reps: ex.reps.map((rep) => ({ rep, weight_kg: null })),
        })),
      });

      setStep(1);
      setDate(new Date().toISOString().split("T")[0]);
      setWorkoutType("");
      setSelectedExercises([]);
      setSearchQuery("");
      setCategoryFilter("All");
      setNote("");
    } catch (error) {
      console.error("Failed to create session", error);
      alert(error instanceof Error ? error.message : "Unable to create session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSets = selectedExercises.reduce((sum, ex) => sum + ex.reps.length, 0);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
                Step {step < 10 ? `0${step}` : step}: {step === 1 ? "Schedule & Type" : step === 2 ? "Select Exercises" : "Finalize Plan"}
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
                {isLoadingTypes ? (
                  <div className="text-center py-8 text-text-dim">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {workoutTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setWorkoutType(type)}
                        className={`bg-surface-card border rounded-2xl p-4 text-left relative overflow-hidden group transition-colors ${
                          workoutType === type
                            ? "border-primary/40"
                            : "border-white/5 hover:border-white/20"
                        }`}
                      >
                        {workoutType === type && (
                          <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm text-primary">
                              check_circle
                            </span>
                          </div>
                        )}
                        <span
                          className={`material-symbols-outlined mb-2 ${
                            workoutType === type ? "text-primary" : "text-text-dim"
                          }`}
                        >
                          {WORKOUT_TYPE_ICONS[type] || "fitness_center"}
                        </span>
                        <p className="font-display font-bold text-sm uppercase tracking-tight">
                          {type}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em] mb-4">
                  Note (optional)
                </h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Add a note about this session"
                  className="w-full bg-surface-card border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
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
                {isLoadingExercises && (
                  <p className="text-sm text-text-dim">Loading exercises...</p>
                )}
                {loadError && !isLoadingExercises && (
                  <p className="text-xs text-red-400">{loadError}</p>
                )}
                {!isLoadingExercises && filteredExercises.length === 0 && (
                  <p className="text-sm text-text-dim">No exercises available. Try another filter.</p>
                )}
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[9px] font-bold text-text-dim uppercase tracking-wider">
                          Sets & Reps
                        </label>
                        <div className="flex items-center gap-2 text-[10px] text-text-dim">
                          <span>{exercise.reps.length} set{exercise.reps.length !== 1 ? "s" : ""}</span>
                          <button
                            type="button"
                            onClick={() => addExerciseRepRow(exercise.id)}
                            className="px-2 py-1 rounded-lg bg-primary/10 text-primary font-bold uppercase tracking-wider text-[10px] hover:bg-primary/20"
                          >
                            + Add Set
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {exercise.reps.map((repVal, index) => (
                          <div
                            key={`${exercise.id}-rep-${index}`}
                            className="grid grid-cols-[1fr_auto] gap-2 items-center bg-background-dark/40 border border-white/5 rounded-lg p-2"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-bold text-text-dim w-14">Set {index + 1}</span>
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={repVal}
                                onChange={(e) =>
                                  updateExerciseRepRow(
                                    exercise.id,
                                    index,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-20 bg-surface-highlight border-none rounded text-sm p-2 text-center font-bold text-primary focus:ring-1 focus:ring-primary"
                              />
                              <span className="text-[11px] font-bold text-text-dim">reps</span>
                            </div>
                            {exercise.reps.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExerciseRepRow(exercise.id, index)}
                                className="text-text-dim hover:text-red-400 transition-colors flex items-center gap-1 text-[11px] font-bold"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
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
              disabled={isSubmitting || (step === 2 && isLoadingExercises)}
              className={`flex-1 bg-primary text-white font-bold py-3 lg:py-4 rounded-xl shadow-[0_8px_30px_rgba(59,130,246,0.3)] uppercase tracking-widest text-[10px] lg:text-[11px] flex items-center justify-center gap-2 transition-all ${
                isSubmitting || (step === 2 && isLoadingExercises)
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:brightness-110"
              }`}
            >
              {step === 3 ? (
                <span className="hidden sm:inline">
                  {isSubmitting ? "Creating..." : "Confirm & Create Session"}
                </span>
              ) : (
                <>
                  Continue <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
              {step === 3 && (
                <span className="sm:hidden">{isSubmitting ? "Working..." : "Create Session"}</span>
              )}
            </button>
          </div>
          <div className="h-1.5 w-32 bg-white/10 rounded-full mx-auto mt-4 lg:mt-6"></div>
        </div>
      </div>
    </div>
  );
}
