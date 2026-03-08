"use client";

import { useState, useEffect } from "react";
import { 
  calculateGoalTargets, 
  saveNutritionGoal, 
  fetchLatestMetrics,
  GoalCalculationParams,
  GoalCalculationResult,
  MetricData
} from "@/lib/api/nutrition";

interface SetGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const STEPS = [
  { id: "objective", title: "Objective" },
  { id: "review", title: "Plan" }
];

export default function SetGoalModal({ isOpen, onClose, onSuccess }: SetGoalModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<GoalCalculationParams>({
    age: 25,
    sex: 'male',
    height_cm: 175,
    weight_kg: 75,
    activity_level: 'moderate',
    goal_type: 'maintain',
    goal_speed: 'moderate',
    workout_days_per_week: 3
  });

  const [calcResult, setCalcResult] = useState<GoalCalculationResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadLatestMetrics();
      setCurrentStep(0);
    }
  }, [isOpen]);

  const loadLatestMetrics = async () => {
    try {
      const latest = await fetchLatestMetrics();
      if (latest) {
        setFormData(prev => ({
          ...prev,
          ...latest
        }));
      }
    } catch (err) {
      console.warn("Failed to load metrics:", err);
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      // Before moving to review, calculate
      setIsCalculating(true);
      setError(null);
      try {
        const result = await calculateGoalTargets(formData);
        setCalcResult(result);
        setCurrentStep(prev => prev + 1);
      } catch (err: any) {
        setError(err.message || "Calculation failed");
      } finally {
        setIsCalculating(false);
      }
    } else if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    if (!calcResult) return;
    setIsSaving(true);
    setError(null);
    try {
      await saveNutritionGoal({
        ...formData,
        ...calcResult
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save goal");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto w-screen h-screen">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-surface-dark border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-8 pb-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-white uppercase italic tracking-tight">Focus Protocol</h2>
              <div className="flex gap-2 mt-2">
                {STEPS.map((step, idx) => (
                  <div 
                    key={step.id} 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx <= currentStep ? "w-8 bg-primary" : "w-4 bg-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-text-dim">close</span>
            </button>
          </div>

          <h3 className="text-sm font-bold text-text-dim uppercase tracking-widest">{STEPS[currentStep].title}</h3>
        </div>

        {/* Content */}
        <div className="p-8 pt-4 min-h-[400px] overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            {currentStep === 0 && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest block">Primary Objective</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'cutting', label: 'Fat Loss', icon: 'local_fire_department', color: 'text-orange-500' },
                      { id: 'lean_bulk', label: 'Muscle Gain', icon: 'fitness_center', color: 'text-blue-500' },
                      { id: 'maintain', label: 'Maintenance', icon: 'balance', color: 'text-green-500' },
                      { id: 'recomposition', label: 'Recomp', icon: 'refresh', color: 'text-purple-500' },
                    ].map(goal => (
                      <button
                        key={goal.id}
                        onClick={() => setFormData({...formData, goal_type: goal.id as any})}
                        className={`flex flex-col items-center justify-center p-6 rounded-3xl transition-all border gap-3 ${
                          formData.goal_type === goal.id 
                          ? "bg-white/5 border-primary shadow-lg shadow-primary/5" 
                          : "bg-surface-card border-white/5 hover:border-white/10"
                        }`}
                      >
                        <span className={`material-symbols-outlined text-3xl ${formData.goal_type === goal.id ? goal.color : "text-text-dim"}`}>{goal.icon}</span>
                        <p className={`text-xs font-bold uppercase tracking-widest ${formData.goal_type === goal.id ? "text-white" : "text-text-dim"}`}>{goal.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest block">Intensity</label>
                  <div className="flex gap-2">
                     {['slow', 'moderate', 'aggressive'].map(speed => (
                       <button
                         key={speed}
                         onClick={() => setFormData({...formData, goal_speed: speed as any})}
                         className={`flex-1 py-4 rounded-2xl font-bold uppercase tracking-tight text-[10px] transition-all border ${
                          formData.goal_speed === speed 
                          ? "bg-primary border-primary text-white" 
                          : "bg-surface-card border-white/5 text-text-dim hover:border-white/10"
                        }`}
                       >
                         {speed}
                       </button>
                     ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && calcResult && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                    <p className="text-[9px] text-text-dim font-bold uppercase tracking-widest">BMR</p>
                    <p className="text-xl font-display font-bold text-white mt-1">{calcResult.bmr} <span className="text-[10px] text-text-dim">kcal</span></p>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                    <p className="text-[9px] text-text-dim font-bold uppercase tracking-widest">TDEE</p>
                    <p className="text-xl font-display font-bold text-white mt-1">{calcResult.tdee} <span className="text-[10px] text-text-dim">kcal</span></p>
                  </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden text-center">
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em] mb-2 relative z-10">Target Protocol</p>
                  <h4 className="text-5xl font-display font-black text-white italic relative z-10">{calcResult.daily_calories}</h4>
                  <p className="text-xs text-white/70 font-bold uppercase tracking-widest mt-1 relative z-10">Calories Per Day</p>
                  <div className="absolute top-0 right-0 p-8 opacity-20">
                    <span className="material-symbols-outlined text-[120px]">bolt</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface-card border border-white/5 rounded-2xl p-4 text-center">
                    <p className="text-[9px] text-text-dim font-bold uppercase tracking-widest mb-1">Protein</p>
                    <p className="text-lg font-display font-bold text-white">{calcResult.protein_g}g</p>
                  </div>
                  <div className="bg-surface-card border border-white/5 rounded-2xl p-4 text-center">
                    <p className="text-[9px] text-text-dim font-bold uppercase tracking-widest mb-1">Carbs</p>
                    <p className="text-lg font-display font-bold text-white">{calcResult.carbs_g}g</p>
                  </div>
                  <div className="bg-surface-card border border-white/5 rounded-2xl p-4 text-center">
                    <p className="text-[9px] text-text-dim font-bold uppercase tracking-widest mb-1">Fat</p>
                    <p className="text-lg font-display font-bold text-white">{calcResult.fat_g}g</p>
                  </div>
                </div>

                <div className="bg-surface-card border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-cyan-500">water_drop</span>
                  </div>
                  <div>
                    <p className="text-[9px] text-text-dim font-bold uppercase tracking-widest">Hydration Target</p>
                    <p className="text-xl font-display font-bold text-white">{(calcResult.hydration_ml / 1000).toFixed(2)} <span className="text-xs text-text-dim ml-1">Liters / Day</span></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0 flex gap-4">
          {currentStep > 0 && (
            <button 
              onClick={handleBack}
              disabled={isCalculating || isSaving}
              className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-xs"
            >
              Back
            </button>
          )}
          
          {currentStep < STEPS.length - 1 ? (
            <button 
              onClick={handleNext}
              disabled={isCalculating}
              className="flex-[2] py-4 bg-primary rounded-2xl text-white font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 text-xs"
            >
              {isCalculating ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>Generate Plan <span className="material-symbols-outlined text-sm">arrow_forward</span></>
              )}
            </button>
          ) : (
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex-[2] py-4 bg-primary rounded-2xl text-white font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 text-xs"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>Commit Goal <span className="material-symbols-outlined text-sm">bolt</span></>
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="mx-8 mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-[10px] text-red-500 font-bold text-center uppercase tracking-widest">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
