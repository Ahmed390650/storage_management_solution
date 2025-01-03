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
  const { accountId, $id, avatar, email, fullName } = currentUser;
  return (
    <main className="flex h-screen">
      <SideBar avatar={avatar} fullName={fullName} email={email} />
      <section className="flex h-full flex-1 flex-col">
        <MobileNavigation
          accountId={accountId}
          avatar={avatar}
          fullName={fullName}
          email={email}
          ownerId={$id}
        />
        <Header accountId={accountId} userId={$id} />
        <div className="main-content">{children}</div>
      </section>
      <Toaster />
    </main>
  );
};

export default layout;
