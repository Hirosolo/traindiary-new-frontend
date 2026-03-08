"use client";

import { useState, useEffect } from "react";
import { 
  fetchLatestMetrics,
  saveUserMetric,
  MetricData
} from "@/lib/api/nutrition";

interface UpdateSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const STEPS = [
  { id: "biodata", title: "Your Bio" },
  { id: "activity", title: "Lifestyle" }
];

export default function UpdateSpecsModal({ isOpen, onClose, onSuccess }: UpdateSpecsModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<MetricData>>({
    age: 25,
    sex: 'male',
    height_cm: 175,
    weight_kg: 75,
    activity_level: 'moderate',
    workout_days_per_week: 3
  });

  useEffect(() => {
    if (isOpen) {
      loadLatestMetrics();
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

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await saveUserMetric(formData);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save specs");
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
              <h2 className="text-2xl font-display font-bold text-white uppercase italic tracking-tight">Biological Specs</h2>
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
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-4">
                  <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest block">Biological Sex</label>
                  <div className="flex gap-3">
                    {['male', 'female'].map(s => (
                      <button
                        key={s}
                        onClick={() => setFormData({...formData, sex: s as any})}
                        className={`flex-1 py-4 rounded-2xl font-bold uppercase tracking-tight transition-all border ${
                          formData.sex === s 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-surface-card border-white/5 text-text-dim hover:border-white/10"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest block">Age</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary text-white font-display font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest block">Height (cm)</label>
                  <input 
                    type="number" 
                    value={formData.height_cm}
                    onChange={e => setFormData({...formData, height_cm: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary text-white font-display font-medium"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest block">Weight (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={formData.weight_kg}
                    onChange={e => setFormData({...formData, weight_kg: parseFloat(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary text-white font-display font-medium"
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest block">Activity Level</label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
                      { id: 'light', label: 'Light', desc: '1–3 days/week' },
                      { id: 'moderate', label: 'Moderate', desc: '3–5 days/week' },
                      { id: 'heavy', label: 'Heavy', desc: '6–7 days/week' },
                      { id: 'athlete', label: 'Athlete', desc: 'Intense training / Physical job' },
                    ].map(level => (
                      <button
                        key={level.id}
                        onClick={() => setFormData({...formData, activity_level: level.id as any})}
                        className={`flex items-center justify-between p-5 rounded-2xl text-left transition-all border ${
                          formData.activity_level === level.id 
                          ? "bg-primary/10 border-primary" 
                          : "bg-surface-card border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div>
                          <p className={`font-bold uppercase tracking-tight ${formData.activity_level === level.id ? "text-primary" : "text-white"}`}>{level.label}</p>
                          <p className="text-[10px] text-text-dim mt-0.5">{level.desc}</p>
                        </div>
                        {formData.activity_level === level.id && (
                          <span className="material-symbols-outlined text-primary">check_circle</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest block">Workout Days / Week</label>
                  <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4 px-6">
                    <button onClick={() => setFormData({...formData, workout_days_per_week: Math.max(0, (formData.workout_days_per_week || 0) - 1)})} className="text-white hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">remove_circle</span>
                    </button>
                    <span className="text-2xl font-display font-bold text-white">{formData.workout_days_per_week}</span>
                    <button onClick={() => setFormData({...formData, workout_days_per_week: Math.min(7, (formData.workout_days_per_week || 0) + 1)})} className="text-white hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">add_circle</span>
                    </button>
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
              disabled={isSaving}
              className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-xs"
            >
              Back
            </button>
          )}
          
          {currentStep < STEPS.length - 1 ? (
            <button 
              onClick={handleNext}
              className="flex-[2] py-4 bg-primary rounded-2xl text-white font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 text-xs"
            >
              Next Step <span className="material-symbols-outlined text-sm">arrow_forward</span>
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
                <>Save Specs <span className="material-symbols-outlined text-sm">save</span></>
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
