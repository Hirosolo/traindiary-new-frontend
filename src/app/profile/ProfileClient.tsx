"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMyProfile, type ApiUser } from "../../lib/api/profile";

const settings = [
  { icon: "lock", label: "Change Password" },
  { icon: "language", label: "Language", value: "English" },
];

export default function ProfileClient() {
  const { user, isLoading, logout } = useAuth();
  const [profile, setProfile] = useState<ApiUser | null>(null);

  const displayName = useMemo(() => {
    if (profile?.username) return profile.username;
    if (user?.username) return user.username;
    return "";
  }, [profile?.username, user?.username]);

  const displayEmail = useMemo(() => profile?.email ?? user?.email ?? "", [profile?.email, user?.email]);

  const displayPhone = useMemo(() => profile?.phone_number ?? "", [profile?.phone_number]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!user) return;
      try {
        const data = await fetchMyProfile();
        if (!ignore) setProfile(data);
      } catch {
        // fall back silently
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [user]);

  const initials = useMemo(() => {
    const n = displayName?.trim();
    if (!n) return "";
    const parts = n.split(/\s+/);
    const letters = (parts[0]?.[0] ?? "").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
    return letters || n[0]?.toUpperCase() || "";
  }, [displayName]);

  if (isLoading) {
    return (
      <div className="relative flex min-h-[50vh] w-full items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-3xl text-text-dim">progress_activity</span>
      </div>
    );
  }

  return (
    <>
      <header className="flex flex-col items-center pt-12 pb-10">
        <div className="group relative cursor-pointer">
          <div className="h-24 w-24 rounded-full border border-surface-card/80 p-1.5 transition-colors group-hover:border-primary/50">
            {profile?.avatar_url ? (
              <Image
                alt="Profile avatar"
                className="h-full w-full rounded-full object-cover"
                src={profile.avatar_url}
                width={96}
                height={96}
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white/10 text-lg font-semibold">
                {initials}
              </div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background-dark bg-primary">
            <span className="material-symbols-outlined text-[14px] text-white">add</span>
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">{displayName || "Profile"}</h1>
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.3em] text-text-dim">Premium Member</p>
      </header>

      <main className="flex-1 space-y-10">
        <section>
          <h2 className="mb-4 px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-dim">User Information</h2>
          <div className="overflow-hidden rounded-xl border border-surface-highlight bg-surface-card">
            {[
              { label: "Name", value: displayName || "-" },
              { label: "Phone", value: displayPhone || "-" },
              { label: "Email", value: displayEmail || "-" },
            ].map((item, index, arr) => (
              <div key={item.label}>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-text-dim">{item.label}</span>
                  <span className="text-sm font-medium text-white">{item.value}</span>
                </div>
                {index < arr.length - 1 && <div className="mx-5 h-px bg-surface-highlight" />}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-dim">Settings</h2>
          <div className="overflow-hidden rounded-xl border border-surface-highlight bg-surface-card">
            {settings.map((item, index) => (
              <div key={item.label}>
                <button className="group flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-text-dim transition-colors group-hover:text-primary">
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium text-white">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-dim">
                    {item.value && <span className="text-xs">{item.value}</span>}
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </div>
                </button>
                {index < settings.length - 1 && <div className="mx-5 h-px bg-surface-highlight" />}
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-center gap-6 pt-6">
          <button onClick={logout} className="rounded-lg px-4 py-2 text-sm font-medium text-text-dim transition-colors hover:text-white">
            Log Out
          </button>
          <button className="rounded-lg border border-transparent px-4 py-2 text-xs font-medium text-red-500/70 transition-colors hover:border-red-500/30 hover:text-red-500">
            Delete Account
          </button>
        </section>
      </main>
    </>
  );
}
