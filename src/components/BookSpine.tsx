import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Book } from "../data/books";
import { useSampledBook } from "../lib/coverPalette";
import { COVER_W, faceFont, finishSheen, finishTexture } from "./bookFaces";

type Props = {
  book: Book;
  hidden?: boolean;
  className?: string;
  onOpen: (el: HTMLElement) => void;
};

const PULL = 96;
const LIFT = -26;

export function BookSpine({ book: raw, hidden, className = "", onOpen }: Props) {
  const book = useSampledBook(raw);
  const btn = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);
  const [card, setCard] = useState<{ left: number; top: number } | null>(null);
  const leave = useRef<number | undefined>(undefined);

  const enter = () => {
    window.clearTimeout(leave.current);
    const r = btn.current!.getBoundingClientRect();
    setCard({ left: r.left + r.width / 2, top: r.top - 14 });
    setHover(true);
  };
  const exit = () => {
    window.clearTimeout(leave.current);
    leave.current = window.setTimeout(() => setHover(false), 90);
  };
  useEffect(() => () => window.clearTimeout(leave.current), []);
  useEffect(() => {
    if (!hover) return;
    const off = () => setHover(false);
    window.addEventListener("scroll", off, true);
    return () => window.removeEventListener("scroll", off, true);
  }, [hover]);

  const lean = hover ? 0 : book.lean;
  const pull = hover ? PULL : 0;
  const lift = hover ? LIFT : 0;
  const title = book.caps ? book.title.toUpperCase() : book.title;

  return (
    <>
      <button
        ref={btn}
        type="button"
        data-book-id={book.id}
        aria-label={`${book.title} — ${book.author}`}
        onPointerEnter={enter}
        onPointerLeave={exit}
        onFocus={enter}
        onBlur={exit}
        onClick={() => {
          setHover(false);
          onOpen(btn.current!);
        }}
        className={`relative shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${className}`}
        style={{
          width: book.width,
          height: book.height,
          zIndex: hover ? 40 : undefined,
          transformStyle: "preserve-3d",
          opacity: hidden ? 0 : 1,
          transition: "opacity 300ms",
        }}
      >
        <span
          className="absolute inset-0 block"
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "50% 100%",
            transform: `rotateY(var(--ry, 0deg)) rotateZ(${lean}deg) translateZ(${pull + book.depth}px) translateY(${lift}px)`,
            transition: "transform 620ms cubic-bezier(0.22, 1, 0.32, 1)",
          }}
        >
          <SpineFace book={book} title={title} />
          {/* hinged front cover, folded back into the shelf */}
          <span
            className="absolute left-full top-0 block overflow-hidden"
            style={{
              width: COVER_W,
              height: book.height,
              transformOrigin: "left center",
              transform: "rotateY(90deg)",
              backfaceVisibility: "hidden",
              background: book.spine,
            }}
          >
            {book.cover && (
              <img src={book.cover} alt="" className="h-full w-full object-cover" draggable={false} />
            )}
          </span>
        </span>
      </button>

      {hover &&
        card &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[100] w-[248px] -translate-x-1/2 -translate-y-full animate-rise rounded-sm border border-border/70 bg-card/90 px-4 py-3 shadow-[0_18px_40px_-18px_rgba(60,40,20,.45)] backdrop-blur-md"
            style={{ left: card.left, top: card.top + LIFT }}
          >
            <p className="font-display text-[20px] leading-tight text-foreground">{book.title}</p>
            <p className="mt-0.5 font-display text-[15px] italic text-muted-foreground">{book.author}</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {book.year} · {book.binding}
            </p>
            <p className="mt-1 font-mono text-[11px] tracking-[0.12em] text-primary">
              {book.rating ? (
                "★".repeat(book.rating)
              ) : book.bookmarks ? (
                <span className="uppercase">Bookmarks × {book.bookmarks}</span>
              ) : (
                <span className="uppercase text-muted-foreground">Unrated</span>
              )}
            </p>
            {book.genres && (
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
                {book.genres.join(" / ")}
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

export function SpineFace({ book, title }: { book: Book; title: string }) {
  return (
    <span
      className="absolute inset-0 block overflow-hidden"
      style={{
        background: book.spine,
        boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,.25)",
        backfaceVisibility: "hidden",
      }}
    >
      {/* cover-art wraparound from the left edge */}
      {book.cover && (
        <img
          src={book.cover}
          alt=""
          draggable={false}
          className="absolute inset-y-0 left-0 h-full max-w-none opacity-35"
          style={{ width: "auto", filter: "blur(.4px) saturate(.9)" }}
        />
      )}
      <span className="absolute inset-0" style={{ background: book.spine, opacity: 0.72 }} />
      {book.band && (
        <>
          <span className="absolute inset-x-0 top-[7%] h-[3px]" style={{ background: book.band }} />
          <span className="absolute inset-x-0 top-[calc(7%+6px)] h-px" style={{ background: book.band }} />
          <span className="absolute inset-x-0 bottom-[9%] h-[3px]" style={{ background: book.band }} />
        </>
      )}
      <span
        className={`absolute left-1/2 top-[13%] block max-h-[64%] overflow-hidden whitespace-nowrap text-ellipsis ${faceFont[book.face]}`}
        style={{
          color: book.ink,
          writingMode: "vertical-rl",
          transform: "translateX(-50%)",
          fontSize: Math.min(15, Math.max(10, book.width * 0.42)),
          letterSpacing: book.caps ? "0.14em" : "0.02em",
          opacity: 1 - book.wear * 0.5,
        }}
      >
        {title}
      </span>
      {book.width >= 44 && (
        <span
          className="absolute bottom-[16%] left-1/2 block max-h-[22%] -translate-x-1/2 overflow-hidden whitespace-nowrap font-display text-[10px] italic"
          style={{ color: book.ink, writingMode: "vertical-rl", opacity: 0.75 }}
        >
          {book.author}
        </span>
      )}
      {book.width >= 30 && (
        <span
          className="absolute bottom-[3%] left-0 right-0 truncate px-0.5 text-center font-mono text-[6px] uppercase tracking-[0.08em]"
          style={{ color: book.ink, opacity: 0.6 }}
        >
          {book.publisher.split(" ")[0]}
        </span>
      )}
      <span className="absolute inset-0" style={{ backgroundImage: finishTexture[book.finish] }} />
      <span className="absolute inset-0" style={{ backgroundImage: finishSheen[book.finish] }} />
      <span
        className="absolute inset-0"
        style={{
          opacity: book.wear,
          background:
            "linear-gradient(180deg, rgba(255,246,225,.5) 0%, transparent 18%, transparent 82%, rgba(255,246,225,.35) 100%), radial-gradient(120% 40% at 50% 0%, rgba(255,240,210,.25), transparent)",
        }}
      />
      <span className="absolute inset-0" style={{ boxShadow: "inset 1px 0 0 rgba(255,255,255,.18), inset -1px 0 0 rgba(0,0,0,.25)" }} />
    </span>
  );
}
