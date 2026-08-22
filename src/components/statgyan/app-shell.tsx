import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useStatgyan } from "@/lib/statgyan/store";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpenCheck,
  Brain,
  Building2,
  Clapperboard,
  Command,
  FileStack,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Route as RouteIcon,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { DemoMode } from "./demo-mode";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/competencies", label: "My Competencies", icon: Gauge },
  { to: "/dashboard/gaps", label: "Skill Gaps", icon: Target },
  { to: "/dashboard/path", label: "Learning Path", icon: RouteIcon },
  { to: "/dashboard/tutor", label: "AI Tutor", icon: Brain },
  { to: "/dashboard/quiz-lab", label: "AI Quiz Lab", icon: Sparkles },
  { to: "/dashboard/materials", label: "Learning Materials", icon: FileStack },
  { to: "/dashboard/igot", label: "iGOT Connect", icon: BookOpenCheck },
  { to: "/dashboard/assessments", label: "Assessments", icon: ListChecks },
  { to: "/dashboard/analytics", label: "Capability Analytics", icon: BarChart3 },
  { to: "/dashboard/admin", label: "Admin / Organization", icon: Building2 },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  return (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active =
          to === "/dashboard"
            ? location.pathname === "/dashboard"
            : location.pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-white/80 text-primary shadow-sm shadow-indigo-900/10"
                : "text-slate-600 hover:bg-white/50 hover:text-slate-900",
            )}
          >
            <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-lg shadow-indigo-600/25">
        <GraduationCap className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold tracking-tight">STATGYAN AI</span>
        <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          From Data to Capability
        </span>
      </span>
    </Link>
  );
}

export function AppShell() {
  const [demoOn, setDemoOn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { user, signOut } = useAuth();
  const { profile } = useStatgyan();
  const navigate = useNavigate();

  const runExecutiveQuery = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setQuery("");
    navigate(`/dashboard/admin?q=${encodeURIComponent(q)}&answer=1`);
  };

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/60 bg-white/45 backdrop-blur-2xl lg:flex">
        <div className="px-5 py-5">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <NavLinks />
        </div>
        <div className="border-t border-white/70 p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              {(user?.name ?? profile.name)
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-semibold">{profile.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {profile.department}
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={async () => {
                    await signOut();
                    navigate("/");
                  }}
                  aria-label="Sign out"
                >
                  <LogOut className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sign out</TooltipContent>
            </Tooltip>
          </div>
          <Link
            to="/architecture"
            className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary"
          >
            <ShieldAlert className="size-3" /> System architecture & responsible AI
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-white/60 bg-white/55 px-3 py-2 backdrop-blur-2xl lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open navigation menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-4">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="mb-4">
              <Brand />
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <Brand />
      </header>

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Executive command bar */}
        <div className="sticky top-0 z-20 hidden border-b border-white/60 bg-white/40 px-6 py-2.5 backdrop-blur-2xl lg:block">
          <form onSubmit={runExecutiveQuery} className="relative mx-auto max-w-2xl">
            <Command className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about workforce capability…  e.g. “Which department needs training?”"
              className="glass-subtle border-white/70 pl-9 pr-24 text-sm placeholder:text-muted-foreground/70"
              aria-label="Ask the executive AI a question"
            />
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 gap-1"
            >
              <Search className="size-3.5" /> Ask AI
            </Button>
          </form>
        </div>

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-16">
          <Outlet />

          {/* Demo entry */}
          {!demoOn && (
            <div className="mt-10 flex justify-center">
              <Button
                onClick={() => setDemoOn(true)}
                className="gap-2 rounded-full shadow-lg shadow-indigo-600/25"
              >
                <Clapperboard className="size-4" />
                Run AI Capability Demo
              </Button>
            </div>
          )}
          <footer className="mt-8 flex flex-col items-center gap-1 text-center text-[11px] text-muted-foreground">
            <p>
              STATGYAN AI · Demonstration build — iGOT Karmayogi catalogue shown is a
              demo dataset behind an API-ready adapter, not a live government API.
            </p>
            <p>All AI outputs are labelled and explainable. No respondent data is processed.</p>
          </footer>
        </main>
      </div>

      {demoOn && <DemoMode onExit={() => setDemoOn(false)} />}
    </div>
  );
}
