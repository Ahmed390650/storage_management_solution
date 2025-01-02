import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import SideBar from "@/components/SideBar";
import { Toaster } from "@/components/ui/toaster";
import { getCurrrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import React from "react";
export const dynamic = "force-dynamic";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrrentUser();

  if (!currentUser) return redirect("/sign-in");
  return (
    <main className="flex h-screen">
      <SideBar {...currentUser} />
      <section className="flex h-full flex-1 flex-col">
        <MobileNavigation {...currentUser} />
        <Header accountId={currentUser.accountId} userId={currentUser.$id} />
        <div className="main-content">{children}</div>
      </section>
      <Toaster />
    </main>
  );
};

export default layout;
