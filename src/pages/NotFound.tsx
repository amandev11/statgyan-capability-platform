import { PageBackdrop } from "@/components/quiza/nav";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="studio-light relative flex min-h-screen flex-col">
      <PageBackdrop />
      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        <p className="eyebrow">404 · Off the map</p>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          This question doesn't exist.
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-secondary">
          The page you're after was moved, renamed, or never made it past the
          editors. The quizzes, however, are all still here.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="btn-specular inline-flex h-11 items-center rounded-xl px-6 text-sm font-semibold"
          >
            Back home
          </Link>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-xl border-white/10 bg-transparent hover:bg-white/[0.05]"
          >
            <Link to="/explore">Explore quizzes</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
