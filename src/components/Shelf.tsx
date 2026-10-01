import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Book } from "../data/books";
import { BookSpine } from "./BookSpine";

export type Rect = { left: number; top: number; width: number; height: number };

type Props = {
  books: Book[];
  openId?: string | null;
  onOpen: (index: number, rect: Rect) => void;
};

const LOOP_MIN = 2600;
const MAX_RY = 34;

export function Shelf({ books, openId, onOpen }: Props) {
  const rail = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const rowWidth = books.reduce((w, b) => w + b.width + 2, 0);
  const copies = rowWidth > LOOP_MIN ? 3 : 1;

  // Curved perspective: rotate each spine by its distance from the viewport centre.
  const curve = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const half = box.width / 2 || 1;
    el.querySelectorAll<HTMLElement>("[data-book-id]").forEach((s) => {
      const r = s.getBoundingClientRect();
      const t = Math.max(-1, Math.min(1, (r.left + r.width / 2 - cx) / half));
      const ry = -Math.sign(t) * Math.pow(Math.abs(t), 1.35) * MAX_RY;
      s.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    });
  }, []);

  // Seamless loop: keep the viewport inside the middle copy.
  const wrap = useCallback(() => {
    const el = rail.current;
    if (!el || copies === 1) return;
    const seg = el.scrollWidth / 3;
    if (el.scrollLeft < seg * 0.5) el.scrollLeft += seg;
    else if (el.scrollLeft > seg * 1.5) el.scrollLeft -= seg;
  }, [copies]);

  useLayoutEffect(() => {
    const el = rail.current;
    if (!el) return;
    if (copies === 3) el.scrollLeft = el.scrollWidth / 3;
    else el.scrollLeft = 0;
    curve();
  }, [books, copies, curve]);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setOverflowing(el.scrollWidth > el.clientWidth + 1);
      curve();
    });
    ro.observe(el);
    const onScroll = () => {
      wrap();
      curve();
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", curve);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", curve);
    };
  }, [curve, wrap]);

  useEffect(() => {
    if (openId) return;
    const onKey = (e: KeyboardEvent) => {
      const el = rail.current;
      if (!el || (e.target as HTMLElement).closest("input,textarea")) return;
      if (e.key === "ArrowRight") el.scrollBy({ left: 320, behavior: "smooth" });
      if (e.key === "ArrowLeft") el.scrollBy({ left: -320, behavior: "smooth" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  const openAt = (i: number, el: HTMLElement) => {
    if (drag.current?.moved) return;
    const r = el.getBoundingClientRect();
    onOpen(i, { left: r.left, top: r.top, width: r.width, height: r.height });
  };

  return (
    <div className="relative">
      <div
        ref={rail}
        className={`no-scrollbar flex cursor-grab items-end gap-[2px] overflow-x-auto px-[8vw] pb-6 pt-24 active:cursor-grabbing ${overflowing ? "" : "justify-center"}`}
        style={{ perspective: "1400px", perspectiveOrigin: "50% 65%" }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") return;
          drag.current = { x: e.clientX, left: rail.current!.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 4) d.moved = true;
          rail.current!.scrollLeft = d.left - dx;
        }}
        onPointerUp={() => setTimeout(() => (drag.current = null))}
        onPointerLeave={() => (drag.current = null)}
      >
        {Array.from({ length: copies }).flatMap((_, c) =>
          books.map((b, i) => (
            <BookSpine
              key={`${c}-${b.id}`}
              book={b}
              hidden={openId === b.id}
              onOpen={(el) => openAt(i, el)}
            />
          )),
        )}
      </div>
      {overflowing && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[10vw] bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[10vw] bg-gradient-to-l from-background to-transparent" />
        </>
      )}
      {/* the shelf board + soft ground shadow */}
      <div className="mx-auto -mt-6 h-px w-[84%] bg-gradient-to-r from-transparent via-foreground/25 to-transparent" />
      <div className="mx-auto h-8 w-[78%] bg-gradient-to-b from-foreground/8 to-transparent blur-[2px]" />
    </div>
  );
}
