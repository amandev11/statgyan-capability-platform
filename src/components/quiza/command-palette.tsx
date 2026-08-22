import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Compass, Home, LayoutList, Search, Trophy, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { open, setOpen };
}

export function CommandPalette({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const quizzes = useQuery(api.quiza.listQuizzes);
  const [query, setQuery] = useState("");

  // Reset the query when the palette closes (derived from open, no effect needed)
  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) setQuery("");
  };

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  const q = query.trim().toLowerCase();
  const filtered =
    quizzes?.filter(
      (quiz) =>
        !q ||
        quiz.title.toLowerCase().includes(q) ||
        quiz.category.toLowerCase().includes(q),
    ) ?? [];
  const categories = [
    ...new Set((quizzes ?? []).map((quiz) => quiz.category)),
  ].filter((c) => !q || c.toLowerCase().includes(q));

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder="Search quizzes, subjects…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {quizzes === undefined ? "Loading…" : "Nothing matches that yet."}
        </CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/dashboard")} value="home dashboard">
            <Home /> Home
          </CommandItem>
          <CommandItem onSelect={() => go("/explore")} value="explore discover">
            <Compass /> Explore
          </CommandItem>
          <CommandItem onSelect={() => go("/leaderboard")} value="leaderboard ranking">
            <Trophy /> Leaderboard
          </CommandItem>
          <CommandItem onSelect={() => go("/profile")} value="profile account">
            <User /> Profile
          </CommandItem>
        </CommandGroup>
        {categories.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Subjects">
              {categories.map((category) => (
                <CommandItem
                  key={category}
                  value={`category ${category}`}
                  onSelect={() => go(`/explore?category=${encodeURIComponent(category)}`)}
                >
                  <LayoutList /> {category}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        {filtered.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Quizzes">
              {filtered.map((quiz) => (
                <CommandItem
                  key={quiz._id}
                  value={`quiz ${quiz.title} ${quiz.category}`}
                  onSelect={() => go(`/quiz/${quiz.slug}`)}
                >
                  <Search className="opacity-50" />
                  <span className="truncate">{quiz.title}</span>
                  <span className="ml-auto text-xs text-muted-qz">{quiz.category}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      aria-label="Open search"
      className="h-9 gap-2 rounded-lg border hairline-faint bg-white/[0.02] px-3 text-muted-qz hover:bg-white/[0.05] hover:text-secondary"
    >
      <Search className="size-3.5" />
      <span className="hidden text-xs lg:inline">Search</span>
      <kbd className="hidden rounded border hairline-faint bg-white/[0.04] px-1.5 py-0.5 font-sans text-[10px] text-muted-qz lg:inline">
        ⌘K
      </kbd>
    </Button>
  );
}
