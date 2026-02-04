import { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles, Plus, ChevronDown, ChevronUp, Check, Calendar, Dumbbell, Utensils, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
}

interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration: string;
  days: WorkoutDay[];
}

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  items: string[];
}

interface NutritionDay {
  day: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  meals: Meal[];
}

interface NutritionPlan {
  id: string;
  name: string;
  description: string;
  duration: string;
  days: NutritionDay[];
}

type PlanType = 'workout' | 'nutrition';

interface PlanMessage {
  type: 'plan';
  planType: PlanType;
  plan: WorkoutPlan | NutritionPlan;
  status: 'pending' | 'applied' | 'updated';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  planData?: PlanMessage;
}

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Welcome to TrainDiary. I\'m your AI training assistant. I can help you create workout plans, nutrition plans, and track your progress. What would you like to work on today?',
    timestamp: new Date(),
  },
];

const SUGGESTED_QUESTIONS = [
  'Create a 4-day split workout',
  'Build a meal plan for bulking',
  'Show my current workout plan',
  'Adjust my nutrition macros',
];

// Sample workout plan for demo
const SAMPLE_WORKOUT_PLAN: WorkoutPlan = {
  id: 'wp-001',
  name: 'Hypertrophy Focus 4-Day Split',
  description: 'A balanced 4-day split targeting each muscle group twice per week with optimal volume for muscle growth.',
  duration: '4 days/week',
  days: [
    {
      day: 'Day 1 - Push (Chest, Shoulders, Triceps)',
      focus: 'Upper body pushing movements',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '8-10', notes: 'RPE 8' },
        { name: 'Overhead Press', sets: 3, reps: '10-12', notes: 'Standing' },
        { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12' },
        { name: 'Lateral Raises', sets: 4, reps: '15-20', notes: 'Drop set on last set' },
        { name: 'Tricep Pushdowns', sets: 3, reps: '12-15' },
        { name: 'Overhead Tricep Extension', sets: 3, reps: '12-15' },
      ],
    },
    {
      day: 'Day 2 - Pull (Back, Biceps, Rear Delts)',
      focus: 'Upper body pulling movements',
      exercises: [
        { name: 'Deadlifts', sets: 3, reps: '5-6', notes: 'Heavy, RPE 9' },
        { name: 'Pull-Ups', sets: 4, reps: '8-12', notes: 'Weighted if possible' },
        { name: 'Barbell Rows', sets: 4, reps: '10-12' },
        { name: 'Face Pulls', sets: 4, reps: '15-20' },
        { name: 'Barbell Curls', sets: 3, reps: '10-12' },
        { name: 'Hammer Curls', sets: 3, reps: '12-15' },
      ],
    },
    {
      day: 'Day 3 - Legs (Quads, Hamstrings, Calves)',
      focus: 'Lower body compound and isolation',
      exercises: [
        { name: 'Squats', sets: 4, reps: '6-8', notes: 'RPE 8-9' },
        { name: 'Romanian Deadlifts', sets: 4, reps: '10-12' },
        { name: 'Leg Press', sets: 3, reps: '12-15' },
        { name: 'Walking Lunges', sets: 3, reps: '12 each leg' },
        { name: 'Leg Extensions', sets: 3, reps: '15-20' },
        { name: 'Standing Calf Raises', sets: 4, reps: '15-20' },
      ],
    },
    {
      day: 'Day 4 - Upper Body (Full Upper)',
      focus: 'Complete upper body pump',
      exercises: [
        { name: 'Incline Bench Press', sets: 4, reps: '8-10' },
        { name: 'Cable Rows', sets: 4, reps: '12-15' },
        { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12' },
        { name: 'Lat Pulldowns', sets: 3, reps: '12-15' },
        { name: 'Cable Flyes', sets: 3, reps: '15-20' },
        { name: 'Preacher Curls', sets: 3, reps: '12-15' },
        { name: 'Skull Crushers', sets: 3, reps: '12-15' },
      ],
    },
  ],
};

// Sample nutrition plan for demo
const SAMPLE_NUTRITION_PLAN: NutritionPlan = {
  id: 'np-001',
  name: 'Lean Bulk Nutrition Plan',
  description: 'High protein nutrition plan designed for lean muscle gain with controlled calorie surplus.',
  duration: '7 days',
  days: [
    {
      day: 'Monday',
      totalCalories: 2800,
      totalProtein: 180,
      totalCarbs: 320,
      totalFats: 85,
      meals: [
        {
          name: 'Breakfast',
          calories: 650,
          protein: 45,
          carbs: 70,
          fats: 20,
          items: ['4 whole eggs', '2 slices whole grain toast', '1 avocado', 'Greek yogurt'],
        },
        {
          name: 'Lunch',
          calories: 750,
          protein: 55,
          carbs: 85,
          fats: 22,
          items: ['200g chicken breast', '150g brown rice', 'Mixed vegetables', 'Olive oil'],
        },
        {
          name: 'Pre-Workout',
          calories: 350,
          protein: 25,
          carbs: 45,
          fats: 8,
          items: ['Protein shake', '1 banana', 'Rice cakes'],
        },
        {
          name: 'Dinner',
          calories: 700,
          protein: 45,
          carbs: 80,
          fats: 25,
          items: ['200g salmon', '200g sweet potato', 'Broccoli', 'Butter'],
        },
        {
          name: 'Before Bed',
          calories: 350,
          protein: 10,
          carbs: 40,
          fats: 10,
          items: ['Casein protein shake', 'Almonds', 'Berries'],
        },
      ],
    },
    {
      day: 'Tuesday',
      totalCalories: 2750,
      totalProtein: 175,
      totalCarbs: 310,
      totalFats: 82,
      meals: [
        {
          name: 'Breakfast',
          calories: 620,
          protein: 42,
          carbs: 68,
          fats: 18,
          items: ['Protein oatmeal', 'Whey protein', 'Peanut butter', 'Blueberries'],
        },
        {
          name: 'Lunch',
          calories: 720,
          protein: 50,
          carbs: 82,
          fats: 20,
          items: ['180g lean beef', 'Pasta', 'Tomato sauce', 'Parmesan'],
        },
        {
          name: 'Pre-Workout',
          calories: 380,
          protein: 28,
          carbs: 48,
          fats: 8,
          items: ['Turkey sandwich', 'Apple', 'Protein bar'],
        },
        {
          name: 'Dinner',
          calories: 680,
          protein: 40,
          carbs: 75,
          fats: 26,
          items: ['200g tilapia', 'Quinoa', 'Asparagus', 'Olive oil'],
        },
        {
          name: 'Before Bed',
          calories: 350,
          protein: 15,
          carbs: 37,
          fats: 10,
          items: ['Greek yogurt', 'Honey', 'Walnuts'],
        },
      ],
    },
  ],
};

export function AIChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: '1', name: 'Current Session', messages: INITIAL_MESSAGES, createdAt: new Date() },
  ]);
  const [activeSessionId, setActiveSessionId] = useState('1');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [appliedPlans, setAppliedPlans] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession.messages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Session ${sessions.length + 1}`,
      messages: [
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'New session started! How can I help you today?',
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    };
    setSessions([...sessions, newSession]);
    setActiveSessionId(newSession.id);
  };

  const switchSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const toggleDayExpansion = (dayKey: string) => {
    setExpandedDays((prev) => ({ ...prev, [dayKey]: !prev[dayKey] }));
  };

  const applyPlan = (planId: string) => {
    setAppliedPlans((prev) => new Set([...prev, planId]));
    // Here you would call your backend API
    console.log(`Applying plan ${planId} to database...`);
  };

  const updatePlan = (_planId: string, planType: PlanType) => {
    // Simulate plan update - in real app, this would modify the plan data
    const updatedMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I've updated your ${planType === 'workout' ? 'workout' : 'nutrition'} plan based on your feedback. Here's the revised version:`,
      timestamp: new Date(),
      planData: {
        type: 'plan',
        planType,
        plan: planType === 'workout' ? SAMPLE_WORKOUT_PLAN : SAMPLE_NUTRITION_PLAN,
        status: 'updated',
      },
    };

    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId
          ? { ...session, messages: [...session.messages, updatedMessage] }
          : session
      )
    );
  };

  const generatePlanResponse = (userMessage: string): { content: string; planData?: PlanMessage } => {
    const lowerMsg = userMessage.toLowerCase();

    if (lowerMsg.includes('workout') && (lowerMsg.includes('plan') || lowerMsg.includes('create') || lowerMsg.includes('split'))) {
      return {
        content: 'I\'ve created a 4-day hypertrophy-focused split for you. This plan targets each muscle group optimally for growth. Review the details below and click "Apply Plan" to add it to your schedule.',
        planData: {
          type: 'plan',
          planType: 'workout',
          plan: SAMPLE_WORKOUT_PLAN,
          status: 'pending',
        },
      };
    }

    if (lowerMsg.includes('nutrition') || lowerMsg.includes('meal') || lowerMsg.includes('diet') || lowerMsg.includes('bulking')) {
      return {
        content: 'Here\'s a lean bulk nutrition plan with 2,800 calories and 180g protein daily. Each day is structured with 5 meals to support muscle growth. Review and apply when ready!',
        planData: {
          type: 'plan',
          planType: 'nutrition',
          plan: SAMPLE_NUTRITION_PLAN,
          status: 'pending',
        },
      };
    }

    if (lowerMsg.includes('current') && lowerMsg.includes('plan')) {
      return {
        content: 'Here\'s your current workout plan. You can ask me to adjust any day, exercise, or rep scheme.',
        planData: {
          type: 'plan',
          planType: 'workout',
          plan: SAMPLE_WORKOUT_PLAN,
          status: 'applied',
        },
      };
    }

    if (lowerMsg.includes('adjust') || lowerMsg.includes('update') || lowerMsg.includes('modify') || lowerMsg.includes('change')) {
      return {
        content: 'I can help you adjust your plan. What would you like to change? You can ask me to:\n• Add/remove exercises\n• Change sets/reps\n• Swap days\n• Adjust rest periods\n\nJust tell me what you want to modify!',
      };
    }

    return {
      content: 'I understand. I can help you create workout plans, nutrition plans, or adjust your current routine. What specific aspect of your training would you like to work on?',
    };
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId
          ? { ...session, messages: [...session.messages, userMessage] }
          : session
      )
    );
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generatePlanResponse(content);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        planData: response.planData,
      };

      setSessions((prev) =>
        prev.map((session) =>
          session.id === activeSessionId
            ? { ...session, messages: [...session.messages, aiMessage] }
            : session
        )
      );
      setIsTyping(false);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderWorkoutPlan = (plan: WorkoutPlan, messageId: string, status: string) => {
    const isApplied = appliedPlans.has(plan.id) || status === 'applied';

    return (
      <div className="mt-4 bg-[#0a0a0a] rounded-xl border border-[#252525] overflow-hidden">
        {/* Plan Header */}
        <div className="p-4 bg-[#1a1a1a] border-b border-[#252525]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-[#3b82f6]" />
            </div>
            <div>
              <h4 className="font-semibold text-white">{plan.name}</h4>
              <p className="text-xs text-[#6b7280]">{plan.duration}</p>
            </div>
          </div>
          <p className="text-sm text-[#9ca3af]">{plan.description}</p>
        </div>

        {/* Days */}
        <div className="max-h-[300px] overflow-y-auto chat-scrollbar">
          {plan.days.map((day, idx) => {
            const dayKey = `${messageId}-${idx}`;
            const isExpanded = expandedDays[dayKey] ?? idx === 0;

            return (
              <div key={dayKey} className="border-b border-[#252525] last:border-b-0">
                <button
                  onClick={() => toggleDayExpansion(dayKey)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#151515] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#3b82f6]" />
                    <span className="text-sm font-medium text-white">{day.day}</span>
                    <span className="text-xs text-[#6b7280]">({day.exercises.length} exercises)</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#6b7280]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6b7280]" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <p className="text-xs text-[#6b7280] mb-3">{day.focus}</p>
                    <div className="space-y-2">
                      {day.exercises.map((exercise, exIdx) => (
                        <div
                          key={exIdx}
                          className="flex items-center justify-between py-2 px-3 bg-[#1a1a1a] rounded-lg"
                        >
                          <div>
                            <p className="text-sm text-white">{exercise.name}</p>
                            {exercise.notes && (
                              <p className="text-xs text-[#6b7280]">{exercise.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-[#3b82f6] font-medium">
                              {exercise.sets} × {exercise.reps}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-[#1a1a1a] border-t border-[#252525] flex gap-3">
          {!isApplied ? (
            <>
              <Button
                onClick={() => applyPlan(plan.id)}
                className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Apply Plan
              </Button>
              <Button
                onClick={() => updatePlan(plan.id, 'workout')}
                variant="outline"
                className="border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Adjust
              </Button>
            </>
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500/20 text-green-400 rounded-lg">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Plan Applied</span>
              </div>
              <Button
                onClick={() => updatePlan(plan.id, 'workout')}
                variant="outline"
                className="border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Update
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderNutritionPlan = (plan: NutritionPlan, messageId: string, status: string) => {
    const isApplied = appliedPlans.has(plan.id) || status === 'applied';

    return (
      <div className="mt-4 bg-[#0a0a0a] rounded-xl border border-[#252525] overflow-hidden">
        {/* Plan Header */}
        <div className="p-4 bg-[#1a1a1a] border-b border-[#252525]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Utensils className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white">{plan.name}</h4>
              <p className="text-xs text-[#6b7280]">{plan.duration}</p>
            </div>
          </div>
          <p className="text-sm text-[#9ca3af]">{plan.description}</p>
        </div>

        {/* Days */}
        <div className="max-h-[300px] overflow-y-auto chat-scrollbar">
          {plan.days.map((day, idx) => {
            const dayKey = `${messageId}-${idx}`;
            const isExpanded = expandedDays[dayKey] ?? idx === 0;

            return (
              <div key={dayKey} className="border-b border-[#252525] last:border-b-0">
                <button
                  onClick={() => toggleDayExpansion(dayKey)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#151515] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">{day.day}</span>
                    <span className="text-xs text-[#6b7280]">({day.totalCalories} kcal)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6b7280]">P: {day.totalProtein}g</span>
                    <span className="text-xs text-[#6b7280]">C: {day.totalCarbs}g</span>
                    <span className="text-xs text-[#6b7280]">F: {day.totalFats}g</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#6b7280] ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#6b7280] ml-2" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="space-y-2">
                      {day.meals.map((meal, mIdx) => (
                        <div
                          key={mIdx}
                          className="py-2 px-3 bg-[#1a1a1a] rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">{meal.name}</span>
                            <span className="text-xs text-green-400">{meal.calories} kcal</span>
                          </div>
                          <p className="text-xs text-[#6b7280]">{meal.items.join(', ')}</p>
                          <div className="flex gap-3 mt-1">
                            <span className="text-xs text-[#6b7280]">P: {meal.protein}g</span>
                            <span className="text-xs text-[#6b7280]">C: {meal.carbs}g</span>
                            <span className="text-xs text-[#6b7280]">F: {meal.fats}g</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-[#1a1a1a] border-t border-[#252525] flex gap-3">
          {!isApplied ? (
            <>
              <Button
                onClick={() => applyPlan(plan.id)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Apply Plan
              </Button>
              <Button
                onClick={() => updatePlan(plan.id, 'nutrition')}
                variant="outline"
                className="border-green-500 text-green-400 hover:bg-green-500/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Adjust
              </Button>
            </>
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500/20 text-green-400 rounded-lg">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Plan Applied</span>
              </div>
              <Button
                onClick={() => updatePlan(plan.id, 'nutrition')}
                variant="outline"
                className="border-green-500 text-green-400 hover:bg-green-500/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Update
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Open AI Chat"
      >
        <div className="relative flex items-center justify-center w-14 h-14 bg-[#3b82f6] rounded-full ai-glow transition-transform duration-300 group-hover:scale-110">
          <Sparkles className="w-6 h-6 text-white" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
            <span className="text-[9px] font-bold text-black">AI</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col">
      {/* Chat Window */}
      <div className="w-[420px] h-[640px] bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#111111] border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 bg-[#3b82f6]/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-[#3b82f6]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">TRAIN AI</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-[#6b7280]">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={createNewSession}
              className="flex items-center justify-center w-8 h-8 text-[#6b7280] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
              title="New Session"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-8 h-8 text-[#6b7280] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Session Tabs */}
        {sessions.length > 1 && (
          <div className="flex items-center gap-1 px-4 py-2 bg-[#0a0a0a] border-b border-[#1a1a1a] overflow-x-auto">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => switchSession(session.id)}
                className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
                  session.id === activeSessionId
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-[#1a1a1a] text-[#6b7280] hover:text-white'
                }`}
              >
                {session.name}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`message-enter flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className={`max-w-[95%] ${
                    message.role === 'user'
                      ? 'bg-[#3b82f6] text-white'
                      : 'bg-[#1a1a1a] text-[#e5e7eb]'
                  } rounded-2xl px-4 py-3`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>

                  {/* Render Plan if exists */}
                  {message.planData?.type === 'plan' && (
                    <>
                      {message.planData.planType === 'workout' &&
                        renderWorkoutPlan(
                          message.planData.plan as WorkoutPlan,
                          message.id,
                          message.planData.status
                        )}
                      {message.planData.planType === 'nutrition' &&
                        renderNutritionPlan(
                          message.planData.plan as NutritionPlan,
                          message.id,
                          message.planData.status
                        )}
                    </>
                  )}

                  <span
                    className={`text-[10px] mt-2 block ${
                      message.role === 'user' ? 'text-blue-200' : 'text-[#6b7280]'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start message-enter">
                <div className="bg-[#1a1a1a] rounded-2xl px-4 py-4 flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#6b7280] rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-[#6b7280] rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-[#6b7280] rounded-full typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Suggested Questions - Only show initially */}
        {messages.length <= 1 && (
          <div className="px-4 py-3 border-t border-[#1a1a1a] bg-[#0a0a0a]">
            <p className="text-xs text-[#6b7280] mb-2 uppercase tracking-wider">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSendMessage(question)}
                  className="text-xs px-3 py-1.5 bg-[#1a1a1a] text-[#9ca3af] hover:text-white hover:bg-[#252525] rounded-full border border-[#252525] hover:border-[#3b82f6]/50 transition-all duration-200"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 bg-[#111111] border-t border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your training or nutrition..."
              className="flex-1 bg-[#0a0a0a] border-[#252525] text-white placeholder:text-[#6b7280] focus:border-[#3b82f6] focus:ring-[#3b82f6]/20 h-10 text-sm"
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-10 h-10 p-0 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AIChatBox;
