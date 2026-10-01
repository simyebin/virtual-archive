import { useEffect, useState } from "react";
import type { Book } from "../data/books";
import { useSampledBook } from "../lib/coverPalette";
import { COVER_W } from "./bookFaces";
import { SpineFace } from "./BookSpine";
import type { Rect } from "./Shelf";

type Props = {
  book: Book;
  rect: Rect;
  onClose: () => void;
  onStep: (dir: -1 | 1) => void;
};

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function useViewport() {
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return vp;
}

export function BookDetail({ book: raw, rect, onClose, onStep }: Props) {
  const book = useSampledBook(raw);
  const vp = useViewport();
  const [out, setOut] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOut(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  const retract = () => {
    setOut(false);
    setTimeout(onClose, 620);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") retract();
      if (e.key === "ArrowLeft") onStep(-1);
      if (e.key === "ArrowRight") onStep(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const narrow = vp.w < 720;
  const coverH = narrow ? vp.h * 0.42 : Math.min(vp.h * 0.6, 480);
  const scale = coverH / rect.height;
  const coverW = COVER_W * scale;
  const targetX = narrow ? vp.w / 2 : vp.w * 0.34;
  const targetY = narrow ? 32 + coverH / 2 : vp.h / 2;
  const dx = targetX - (rect.left + rect.width / 2) - coverW / 2;
  const dy = targetY - (rect.top + rect.height / 2);

  const transform = out
    ? `translate3d(${dx}px, ${dy}px, 0) scale(${scale}) rotateY(-90deg)`
    : `translate3d(0,0,0) scale(1) rotateY(0deg)`;

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal aria-label={book.title}>
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-xl"
        style={{ opacity: out ? 1 : 0, transition: "opacity 700ms ease" }}
        onClick={retract}
      />

      <div className="pointer-events-none absolute inset-0" style={{ perspective: "2600px" }}>
        <div
          className="absolute"
          style={{
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            transformStyle: "preserve-3d",
            transform,
            transition: `transform 900ms ${EASE}`,
          }}
        >
          <SpineFace book={book} title={book.caps ? book.title.toUpperCase() : book.title} />
          <div
            className="absolute left-full top-0 overflow-hidden shadow-[0_40px_80px_-30px_rgba(40,25,10,.55)]"
            style={{
              width: COVER_W,
              height: rect.height,
              transformOrigin: "left center",
              transform: "rotateY(90deg)",
              backfaceVisibility: "hidden",
              background: book.spine,
            }}
          >
            {book.cover ? (
              <img src={book.cover} alt={`${book.title} 표지`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col justify-between p-3" style={{ color: book.ink }}>
                <p className="font-display text-[15px] leading-tight">{book.title}</p>
                <p className="font-display text-[9px] italic">{book.author}</p>
              </div>
            )}
            <div className="absolute inset-y-0 left-0 w-[6%] bg-gradient-to-r from-black/30 to-transparent" />
          </div>
        </div>
      </div>

      <section
        className={`absolute overflow-y-auto ${narrow ? "inset-x-0 bottom-0 max-h-[50vh] px-6 pb-8" : "right-[8vw] top-1/2 w-[min(38vw,460px)] -translate-y-1/2"}`}
        style={{
          opacity: out ? 1 : 0,
          transform: `${narrow ? "" : "translateY(-50%)"} translateY(${out ? 0 : 16}px)`,
          transition: `opacity 600ms ease ${out ? 260 : 0}ms, transform 900ms ${EASE} ${out ? 260 : 0}ms`,
        }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {book.recommender ? `Recommended by ${book.recommender}` : `Finished ${book.finished}`}
        </p>
        <h2 className="mt-3 font-display text-[clamp(32px,4vw,52px)] font-light leading-[1.02]">{book.title}</h2>
        <p className="mt-2 font-display text-xl italic text-muted-foreground">
          {book.author} · {book.year}
        </p>
        <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-foreground/85">{book.blurb}</p>
        <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
          {book.rating ? (
            <span aria-label={`${book.rating} / 5`}>
              {"★".repeat(book.rating)}
              <span className="text-foreground/20">{"★".repeat(5 - book.rating)}</span>
            </span>
          ) : (
            "Unrated"
          )}
          <span className="ml-3 text-muted-foreground">
            {book.publisher} · {book.binding}
          </span>
        </p>
        <div className="mt-8 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
          <button className="rounded-full border border-border px-4 py-2 hover:bg-card" onClick={() => onStep(-1)}>
            ← Previous
          </button>
          <button className="rounded-full border border-border px-4 py-2 hover:bg-card" onClick={() => onStep(1)}>
            Next →
          </button>
          <button
            className="rounded-full bg-foreground px-4 py-2 text-background hover:bg-foreground/85"
            onClick={retract}
          >
            Shelve it
          </button>
        </div>
      </section>
    </div>
  );
}
