import { CommandPalette, SearchTrigger, useCommandPalette } from "@/components/quiza/command-palette";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Compass, Home, LogOut, Trophy, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      to="/dashboard"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="StatGyan home"
    >
      <span className="grid size-7 place-items-center rounded-[8px] bg-gradient-to-b from-[#7590ff] to-[#5b76f2] text-sm font-bold text-[#07090c] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
        S
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-[0.14em] text-[var(--qz-text)]">
          STATGYAN
        </span>
        <span className="mt-1 hidden text-[9px] font-medium tracking-[0.08em] text-muted-qz sm:block">
          MEASURE · BUILD · STRENGTHEN
        </span>
      </span>
    </Link>
  );
}

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: Home },
  { to: "/competency", label: "Competency", icon: User },
  { to: "/learning", label: "Learning", icon: Compass },
  { to: "/igot", label: "iGOT", icon: Trophy },
];

const NAV_ITEMS_DESKTOP_ONLY = [
  { to: "/assess", label: "Assessments" },
  { to: "/generate", label: "Generate MCQs" },
  { to: "/materials", label: "Materials" },
  { to: "/assistant", label: "AI Assistant" },
  { to: "/admin", label: "Admin" },
];

function isActive(pathname: string, to: string) {
  if (to === "/dashboard") return pathname === "/dashboard" || pathname.startsWith("/results");
  if (to === "/competency") return pathname.startsWith("/profile") ? false : pathname.startsWith(to);
  return pathname.startsWith(to);
}

export function TopNav() {
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const palette = useCommandPalette();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials = (user?.name ?? user?.email ?? "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          scrolled ? "glass-bar border-x-0 border-t-0" : "border-transparent",
        )}
      >
        <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-4 px-5 sm:px-8">
          <Wordmark />

          <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            {[...NAV_ITEMS, ...NAV_ITEMS_DESKTOP_ONLY].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-200",
                  isActive(location.pathname, item.to)
                    ? "bg-white/[0.06] text-[var(--qz-text)]"
                    : "text-muted-qz hover:bg-white/[0.04] hover:text-secondary",
                )}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <SearchTrigger onClick={() => palette.setOpen(true)} />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="rounded-full outline-none ring-ring/60 focus-visible:ring-2"
                    aria-label="Account menu"
                  >
                    <Avatar className="size-8 border hairline">
                      <AvatarFallback className="surface-2 text-xs font-semibold text-secondary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="truncate font-normal">
                    <span className="block truncate text-sm text-[var(--qz-text)]">
                      {user?.name ?? "Learner"}
                    </span>
                    {user?.email ? (
                      <span className="block truncate text-xs text-muted-qz">{user.email}</span>
                    ) : null}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void signOut()}>
                    <LogOut /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="btn-specular rounded-lg font-semibold">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile tab bar */}
      <nav
        className="glass-bar fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-2xl px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 md:hidden"
        aria-label="Primary mobile"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(location.pathname, item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors duration-200",
                active ? "text-[var(--qz-accent)]" : "text-muted-qz hover:text-secondary",
              )}
            >
              <item.icon className="size-[18px]" strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <CommandPalette open={palette.open} setOpen={palette.setOpen} />
    </>
  );
}

/** Quiz screens hide the main nav; they render their own minimal header. */
export function PageBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <div className="studio-light absolute inset-0" />
    </div>
  );
}
