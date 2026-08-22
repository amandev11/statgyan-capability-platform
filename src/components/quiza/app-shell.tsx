import { PageBackdrop, TopNav } from "@/components/quiza/nav";
import { Outlet } from "react-router";

export function AppShell() {
  return (
    <div className="min-h-screen">
      <PageBackdrop />
      <TopNav />
      <main className="pb-28 pt-20 md:pb-16">
        <Outlet />
      </main>
    </div>
  );
}
