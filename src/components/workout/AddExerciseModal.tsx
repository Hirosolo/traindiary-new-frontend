"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchExercises, type ApiExercise } from "@/lib/api/workouts";

export interface ExerciseToAdd {
  id: string | number;
  name: string;
  category?: string;
  sets: number;
  reps: number;
}

interface Exercise {
  id: string | number;
  name: string;
  category?: string;
  description?: string;
  image?: string;
}

interface SelectedExercise extends Exercise {
  sets: number;
  reps: number;
}

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (exercises: ExerciseToAdd[]) => Promise<void> | void;
  existingExerciseIds: (string | number)[];
}

export default function AddExerciseModal({
  isOpen,
  onClose,
  onSubmit,
  existingExerciseIds,
}: AddExerciseModalProps) {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadExercises = async () => {
      setIsLoadingExercises(true);
      try {
        const exercises = await fetchExercises();
        const normalized: Exercise[] = exercises
          .map((ex: ApiExercise) => ({
            id: ex.exercise_id ?? ex.name,
            name: ex.name,
            category: ex.category,
            description: ex.description,
            image: ex.image,
          }))
          .filter((ex: Exercise) => !existingExerciseIds.includes(ex.id));
        setAvailableExercises(normalized);
      } catch (error) {
        console.error("Failed to fetch exercises", error);
        setAvailableExercises([]);
      } finally {
        setIsLoadingExercises(false);
      }
    };

    loadExercises();
  }, [isOpen, existingExerciseIds]);

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
      setSelectedExercises([...selectedExercises, { ...exercise, sets: 3, reps: 12 }]);
    }
  };

  const updateExerciseConfig = (id: string | number, field: 'sets' | 'reps', value: number) => {
    setSelectedExercises((prev) =>
      prev.map((ex) =>
        ex.id === id ? { ...ex, [field]: value > 0 ? value : 1 } : ex
      )
    );
  };

  const removeExercise = (id: string | number) => {
    setSelectedExercises(selectedExercises.filter((ex) => ex.id !== id));
  };

  const handleNext = () => {
    if (selectedExercises.length === 0) {
      alert("Please select at least one exercise");
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (selectedExercises.length === 0) {
      alert("Please select at least one exercise");
      return;
    }

    setIsSubmitting(true);

    try {
      const exercisesToAdd: ExerciseToAdd[] = selectedExercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        category: ex.category,
        sets: ex.sets,
        reps: ex.reps,
      }));

      await onSubmit(exercisesToAdd);

      setStep(1);
      setSelectedExercises([]);
      setSearchQuery("");
      setCategoryFilter("All");
      onClose();
    } catch (error) {
      console.error("Failed to add exercises", error);
      alert(error instanceof Error ? error.message : "Unable to add exercises");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSets = selectedExercises.reduce((sum, ex) => sum + ex.sets, 0);

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
              <h2 className="text-xl lg:text-2xl font-display font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">add_circle</span>
                Add Exercises
              </h2>
              <p className="text-text-dim text-[10px] mt-1 uppercase tracking-widest font-semibold">
                Step {step < 10 ? `0${step}` : step}: {step === 1 ? "Select Exercises" : "Configure Sets & Reps"}
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
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Step 1: Select Exercises */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-card border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-text-dim/50"
                    placeholder="Search exercises..."
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
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

              <div className="space-y-2">
                {isLoadingExercises && (
                  <div className="text-center py-12 text-text-dim">
                    <span className="material-symbols-outlined animate-spin text-4xl mb-2">progress_activity</span>
                    <p className="text-sm">Loading exercises...</p>
                  </div>
                )}
                {!isLoadingExercises && filteredExercises.length === 0 && (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-text-dim/30 text-5xl mb-2">search_off</span>
                    <p className="text-sm text-text-dim">No exercises available</p>
                  </div>
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
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-highlight flex-shrink-0">
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
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-display font-bold text-sm uppercase tracking-tight truncate">
                            {exercise.name}
                          </h4>
                          <span className="flex-shrink-0 px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary text-[8px] font-bold uppercase">
                            {exercise.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-dim leading-tight line-clamp-1">
                          {exercise.description || "No description"}
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

          {/* Step 2: Configure Sets/Reps */}
          {step === 2 && (
            <div className="space-y-3">
              {selectedExercises.map((exercise) => (
                <div key={exercise.id} className="bg-surface-card border border-white/5 rounded-2xl p-4">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-highlight flex-shrink-0">
                      {exercise.image ? (
                        <img
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                          src={exercise.image}
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                          <span className="material-symbols-outlined text-zinc-600 text-sm">
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
                    <div>
                      <label className="text-[9px] font-bold text-text-dim uppercase tracking-wider block mb-1">
                        Sets
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={exercise.sets}
                        onChange={(e) =>
                          updateExerciseConfig(exercise.id, 'sets', parseInt(e.target.value) || 1)
                        }
                        className="w-full bg-surface-highlight border border-white/5 rounded-lg text-sm p-2 text-center font-bold text-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-text-dim uppercase tracking-wider block mb-1">
                        Reps
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={exercise.reps}
                        onChange={(e) =>
                          updateExerciseConfig(exercise.id, 'reps', parseInt(e.target.value) || 1)
                        }
                        className="w-full bg-surface-highlight border border-white/5 rounded-lg text-sm p-2 text-center font-bold text-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 lg:p-6 border-t border-white/5">
          {step === 1 && selectedExercises.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[9px] font-bold text-text-dim uppercase tracking-[0.2em] block mb-0.5">
                  Selections
                </span>
                <p className="text-sm font-display font-bold">
                  {selectedExercises.length} Exercise{selectedExercises.length !== 1 ? "s" : ""} Selected
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExercises([])}
                className="text-xs font-bold text-primary uppercase tracking-widest hover:text-primary/80 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[9px] font-bold text-text-dim uppercase tracking-[0.2em] block mb-0.5">
                  Ready to Add
                </span>
                <p className="text-sm font-display font-bold">
                  {selectedExercises.length} Exercise{selectedExercises.length !== 1 ? "s" : ""} • {totalSets} Sets Total
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {step === 2 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-[0.3] bg-surface-highlight text-white font-bold py-3 lg:py-4 rounded-xl uppercase tracking-widest text-[10px] lg:text-[11px] border border-white/5 flex items-center justify-center hover:bg-surface-card transition-colors"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
              </button>
            )}
            <button
              type="button"
              onClick={step === 1 ? handleNext : handleSubmit}
              disabled={isSubmitting || selectedExercises.length === 0}
              className={`flex-1 bg-primary text-white font-bold py-3 lg:py-4 rounded-xl shadow-[0_8px_30px_rgba(59,130,246,0.3)] uppercase tracking-widest text-[10px] lg:text-[11px] flex items-center justify-center gap-2 transition-all ${
                isSubmitting || selectedExercises.length === 0
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:brightness-110"
              }`}
            >
              {step === 1 ? (
                <>
                  Continue <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              ) : (
                <>
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">add_circle</span>
                      Add to Session
                    </>
                  )}
                </>
              )}
            </button>
          </div>
          <div className="h-1.5 w-32 bg-white/10 rounded-full mx-auto mt-4 lg:mt-6"></div>
        </div>
      </div>
    </div>
  );
}
