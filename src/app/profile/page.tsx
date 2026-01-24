import type { Metadata } from "next";
import NavBar from "@/components/ui/navbar";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Profile | TrainDiary",
  description: "User profile with membership details and quick settings",
};

export default function ProfilePage() {
  return (
    <div>
      <NavBar className="hidden lg:block" />
      <div className="relative flex min-h-screen w-full flex-col bg-background-dark px-6 lg:px-12 pt-6 lg:pt-24">
        <div className="mx-auto flex w-full max-w-2xl flex-col pb-32">
          <ProfileClient />
        </div>
      </div>
    </div>
  );
}
