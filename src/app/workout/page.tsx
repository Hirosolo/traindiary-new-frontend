"use client";

import NavBar from "@/components/ui/navbar";

export default function WorkoutPage() {

  return (
    <div className="bg-background-dark text-white min-h-screen">
      <NavBar/>

      <div className="flex h-screen pt-16">
        {/* Left Sidebar */}
        <aside className="w-72 border-r border-white/5 bg-surface-dark p-6 flex flex-col gap-8 shrink-0 overflow-y-auto">
          <div>
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-text-dim uppercase mb-4">Activity Overview</h3>
            <div className="space-y-4">
              <div className="bg-surface-card p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <span className="material-symbols-outlined text-sm">local_fire_department</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Current Streak</span>
                </div>
                <p className="text-3xl font-display font-bold">12 <span className="text-sm text-text-dim font-normal">Days</span></p>
              </div>
              <div className="bg-surface-card p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-white/50 mb-1">
                  <span className="material-symbols-outlined text-sm">fitness_center</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Total Workouts</span>
                </div>
                <p className="text-3xl font-display font-bold">184</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-text-dim uppercase mb-4">Monthly Focus</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-dim">Strength Phase</span>
                <span className="text-white font-medium">85%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[85%]"></div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
            <button className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors">
              <span className="material-symbols-outlined text-lg">add</span>
              <span>LOG WORKOUT</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-background-dark overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-display font-bold">October 2023</h2>
                <p className="text-text-dim">You've hit 24 sessions this month. Keep pushing.</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-surface-card border border-white/5 hover:bg-surface-highlight"><span className="material-symbols-outlined">chevron_left</span></button>
                <button className="p-2 rounded-lg bg-surface-card border border-white/5 hover:bg-surface-highlight"><span className="material-symbols-outlined">chevron_right</span></button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
                <div key={d} className="bg-surface-dark py-3 text-center text-[10px] font-bold text-text-dim uppercase tracking-widest border-b border-white/5">{d}</div>
              ))}

              {/* Days */}
              <div className="bg-background-dark h-32 p-3 text-white/20">25</div>
              <div className="bg-background-dark h-32 p-3 text-white/20">26</div>
              <div className="bg-background-dark h-32 p-3 text-white/20">27</div>
              <div className="bg-background-dark h-32 p-3 text-white/20">28</div>
              <div className="bg-background-dark h-32 p-3 text-white/20">29</div>
              <div className="bg-background-dark h-32 p-3 text-white/20">30</div>
              <div className="bg-background-dark h-32 p-3 relative group cursor-pointer hover:bg-surface-dark transition-colors">
                <span className="text-sm font-medium">1</span>
                <div className="mt-2 space-y-1">
                  <div className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded font-bold uppercase truncate">Pull Session</div>
                </div>
              </div>
              <div className="bg-background-dark h-32 p-3 cursor-pointer hover:bg-surface-dark transition-colors">
                <span className="text-sm font-medium text-text-dim">2</span>
              </div>
              <div className="bg-background-dark h-32 p-3 cursor-pointer hover:bg-surface-dark transition-colors">
                <span className="text-sm font-medium">3</span>
                <div className="mt-2 space-y-1">
                  <div className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase truncate">Legs A</div>
                </div>
              </div>
              <div className="bg-background-dark h-32 p-3 cursor-pointer hover:bg-surface-dark transition-colors"><span className="text-sm font-medium text-text-dim">4</span></div>
              <div className="bg-background-dark h-32 p-3 cursor-pointer hover:bg-surface-dark transition-colors">
                <span className="text-sm font-medium">5</span>
                <div className="mt-2 space-y-1">
                  <div className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded font-bold uppercase truncate">Push B</div>
                </div>
              </div>
              <div className="bg-background-dark h-32 p-3 cursor-pointer hover:bg-surface-dark transition-colors"><span className="text-sm font-medium text-text-dim">6</span></div>
              <div className="bg-background-dark h-32 p-3 cursor-pointer hover:bg-surface-dark transition-colors relative">
                <span className="text-sm font-medium text-primary">7</span>
                <div className="mt-2 space-y-1">
                  <div className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase truncate shadow-lg shadow-primary/20">PR Day: Squat</div>
                </div>
                <div className="absolute inset-0 ring-2 ring-primary ring-inset z-10 pointer-events-none"></div>
              </div>
              <div className="bg-background-dark h-32 p-3 cursor-pointer hover:bg-surface-dark transition-colors"><span className="text-sm font-medium text-text-dim">8</span></div>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-[400px] border-l border-white/5 bg-surface-dark overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display font-bold">Workout Details</h3>
              <button className="text-text-dim hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-primary font-bold text-xs uppercase tracking-widest">Oct 7, 2023</span>
                <span className="text-text-dim text-[10px] uppercase font-bold">• 10:45 AM</span>
              </div>
              <h4 className="text-2xl font-display font-bold">Lower Body: Strength A</h4>
            </div>

            <div className="space-y-6">
              <div className="bg-surface-card rounded-2xl p-5 border border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h5 className="font-bold text-white">Barbell Back Squat</h5>
                    <p className="text-[10px] text-text-dim font-bold uppercase">Last: 140kg x 5</p>
                  </div>
                  <button className="text-text-dim"><span className="material-symbols-outlined text-sm">more_vert</span></button>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-text-dim uppercase tracking-tighter px-2">
                    <span>Set</span>
                    <span>Prev</span>
                    <span>Weight</span>
                    <span>Reps</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center bg-background-dark p-2 rounded-lg border border-white/5">
                    <span className="text-xs font-bold text-text-dim pl-2">1</span>
                    <span className="text-xs text-white/40">135kg</span>
                    <input className="bg-surface-highlight border-none rounded text-xs p-1 text-center font-bold text-primary focus:ring-1 focus:ring-primary" type="text" defaultValue="145"/>
                    <input className="bg-surface-highlight border-none rounded text-xs p-1 text-center font-bold focus:ring-1 focus:ring-primary" type="text" defaultValue="5"/>
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center bg-background-dark p-2 rounded-lg border border-white/5">
                    <span className="text-xs font-bold text-text-dim pl-2">2</span>
                    <span className="text-xs text-white/40">135kg</span>
                    <input className="bg-surface-highlight border-none rounded text-xs p-1 text-center font-bold text-primary focus:ring-1 focus:ring-primary" placeholder="145" type="text"/>
                    <input className="bg-surface-highlight border-none rounded text-xs p-1 text-center font-bold focus:ring-1 focus:ring-primary" placeholder="5" type="text"/>
                  </div>
                </div>

                <button className="w-full mt-4 py-2 border border-dashed border-white/10 rounded-lg text-xs font-bold text-text-dim hover:text-white hover:border-white/20 transition-colors">+ ADD SET</button>
              </div>

              <div className="bg-surface-card rounded-2xl p-5 border border-white/5 opacity-60">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-bold text-white">Romanian Deadlift</h5>
                  <span className="material-symbols-outlined text-sm text-text-dim">lock</span>
                </div>
                <p className="text-[10px] text-text-dim font-bold uppercase">Next Exercise</p>
              </div>
            </div>

            <div className="mt-8">
              <button className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all">FINISH WORKOUT</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
