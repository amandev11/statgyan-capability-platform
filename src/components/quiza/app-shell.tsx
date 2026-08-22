import { Outlet } from "react-router";
import { JudgeMode } from "@/components/quiza/judge-mode";
import { PageBackdrop, TopNav } from "@/components/quiza/nav";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import type { ReactNode } from "react";
import { Navigate } from "react-router";

function RequireProfile({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth();
  const profile = useQuery(api.quiza.myProfile);

  if (isLoading || profile === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-shimmer size-8 rounded-lg" />
      </div>
    );
  }
  if (!profile?.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

export function AppShell() {
  return (
    <RequireProfile>
      <div className="min-h-screen">
        <PageBackdrop />
        <TopNav />
        <main className="pb-28 pt-20 md:pb-16">
          <Outlet />
        </main>
        <JudgeMode />
      </div>
    </RequireProfile>
  );
}