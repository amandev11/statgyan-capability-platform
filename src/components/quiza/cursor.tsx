import { useEffect, useRef } from "react";

/**
 * Luxury-detail cursor: an instant 5px dot and a lerped trailing ring.
 * Only mounts for fine pointers without reduced-motion; the native cursor
 * stays visible as a fallback everywhere else.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("custom-cursor-active");

    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let hovering = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      const target = e.target as HTMLElement | null;
      hovering = !!target?.closest(
        "a, button, [role='button'], input, textarea, select, [data-cursor='hover']",
      );
    };

    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${hovering ? 1.7 : 1})`;
      ring.style.borderColor = hovering
        ? "rgba(108,140,255,0.85)"
        : "rgba(255,255,255,0.35)";
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, []);

  return (
    <>
      <style>{`
        html.custom-cursor-active,
        html.custom-cursor-active a,
        html.custom-cursor-active button,
        html.custom-cursor-active [role='button'] { cursor: none; }
        .qz-cursor { position: fixed; top: 0; left: 0; pointer-events: none; z-index: 100; will-change: transform; }
      `}</style>
      <div ref={ringRef} className="qz-cursor hidden md:block" aria-hidden>
        <div
          className="size-7 rounded-full border transition-[border-color] duration-200"
          style={{ borderColor: "rgba(255,255,255,0.35)" }}
        />
      </div>
      <div ref={dotRef} className="qz-cursor hidden md:block" aria-hidden>
        <div className="size-1.5 rounded-full bg-white/90" />
      </div>
    </>
  );
}
