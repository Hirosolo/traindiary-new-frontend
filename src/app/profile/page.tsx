import type { Metadata } from "next";
import Image from "next/image";
import NavBar from "@/components/ui/navbar";

export const metadata: Metadata = {
  title: "Profile | TrainDiary",
  description: "User profile with membership details and quick settings",
};

const userDetails = [
  { label: "Name", value: "Marcus Vane" },
  { label: "Phone", value: "+1 (555) 012-3456" },
  { label: "Email", value: "m.vane@performance.io" },
];

const settings = [
  { icon: "lock", label: "Change Password" },
  { icon: "language", label: "Language", value: "English" },
];

export default function ProfilePage() {
  return (
    <div>
      <NavBar className="hidden lg:block" />
      <div className="relative flex min-h-screen w-full flex-col bg-background-dark px-6 lg:px-12 pt-6 lg:pt-24">
        <div className="mx-auto flex w-full max-w-2xl flex-col pb-32">
          <header className="flex flex-col items-center pt-12 pb-10">
            <div className="group relative cursor-pointer">
              <div className="h-24 w-24 rounded-full border border-surface-card/80 p-1.5 transition-colors group-hover:border-primary/50">
                <Image
                  alt="Profile avatar"
                  className="h-full w-full rounded-full object-cover grayscale-[0.2]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIA72w1cTsYFC5vQGn-QZc8s2_oRmtQ8HfvGnd_iutQyV71NcCrIIQV-23NUWeb0wsPpnsxHQyxXj9YLvZ7gzMQ-L-xNT4JykfaJR12sUi66aAO62iXLMu_-B9khX_5t3TeQ_chEkR8MagUnqRzfmxm4s4JihUsTmpEPRBvKZHDqvCvhYIivgRXS8hDRONRtXRN5VrYoWjyxwiuq3fP6rION1PfQL6kxnSLnCu6Aj1kHS-90zwn2OIyTE8zD8j7PcIRx2D_G6cY3E"
                  width={96}
                  height={96}
                  priority
                />
              </div>
              <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background-dark bg-primary">
                <span className="material-symbols-outlined text-[14px] text-white">
                  add
                </span>
              </div>
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">
              Marcus Vane
            </h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.3em] text-text-dim">
              Premium Member
            </p>
          </header>

          <main className="flex-1 space-y-10">
            <section>
              <h2 className="mb-4 px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-dim">
                User Information
              </h2>
              <div className="overflow-hidden rounded-xl border border-surface-highlight bg-surface-card">
                {userDetails.map((item, index) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between px-5 py-4">
                      <span className="text-sm text-text-dim">
                        {item.label}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {item.value}
                      </span>
                    </div>
                    {index < userDetails.length - 1 && (
                      <div className="mx-5 h-px bg-surface-highlight" />
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-dim">
                Settings
              </h2>
              <div className="overflow-hidden rounded-xl border border-surface-highlight bg-surface-card">
                {settings.map((item, index) => (
                  <div key={item.label}>
                    <button className="group flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-white/5">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px] text-text-dim transition-colors group-hover:text-primary">
                          {item.icon}
                        </span>
                        <span className="text-sm font-medium text-white">
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-text-dim">
                        {item.value && (
                          <span className="text-xs">{item.value}</span>
                        )}
                        <span className="material-symbols-outlined text-[20px]">
                          chevron_right
                        </span>
                      </div>
                    </button>
                    {index < settings.length - 1 && (
                      <div className="mx-5 h-px bg-surface-highlight" />
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col items-center gap-6 pt-6">
              <button className="rounded-lg px-4 py-2 text-sm font-medium text-text-dim transition-colors hover:text-white">
                Log Out
              </button>
              <button className="rounded-lg border border-transparent px-4 py-2 text-xs font-medium text-red-500/70 transition-colors hover:border-red-500/30 hover:text-red-500">
                Delete Account
              </button>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
