import { useEffect, useState } from "react";
import type { Place } from "../data/places";
import type { Rect } from "./Shelf";

// A soft "light study" painted from the place's tones, used until a real photo is added.
export function PlacePhoto({ place, className = "" }: { place: Place; className?: string }) {
  const [a, b, c] = place.tones;
  if (place.photo)
    return (
      <img
        src={place.photo.startsWith("/") ? import.meta.env.BASE_URL + place.photo.slice(1) : place.photo}
        alt={place.name}
        className={`h-full w-full object-cover ${className}`}
        draggable={false}
      />
    );
  return (
    <div
      role="img"
      aria-label={`${place.name} (사진 자리)`}
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(70% 55% at 68% 28%, ${c} 0%, transparent 70%), linear-gradient(170deg, ${b} 0%, ${a} 100%)`,
      }}
    >
      <div
        className="absolute -inset-[20%] animate-drift opacity-60 mix-blend-soft-light"
        style={{ background: `radial-gradient(40% 30% at 30% 70%, ${c}, transparent 70%)` }}
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: `linear-gradient(to top, ${a}cc, transparent)` }} />
      <div
        className="absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      <span className="absolute bottom-3 left-3.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,.45)]">
        photo soon
      </span>
    </div>
  );
}

type Props = {
  place: Place;
  rect: Rect; // the pin head the photo grows out of
  onClose: () => void;
  onStep: (dir: -1 | 1) => void;
  single?: boolean;
};

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export function PlaceDetail({ place, rect, onClose, onStep, single }: Props) {
  const [out, setOut] = useState(false);
  const [vp] = useState({ w: window.innerWidth, h: window.innerHeight });

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
      if (e.key === "ArrowLeft" && !single) onStep(-1);
      if (e.key === "ArrowRight" && !single) onStep(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const narrow = vp.w < 720;
  const h = narrow ? vp.h * 0.5 : Math.min(vp.h * 0.78, 680);
  const w = h * 0.8;
  const cx = narrow ? vp.w / 2 : vp.w * 0.34;
  const cy = narrow ? 24 + h / 2 : vp.h / 2;
  // Start as a speck at the pin head, then open to full size.
  const fromX = rect.left + rect.width / 2 - cx;
  const fromY = rect.top + rect.height / 2 - cy;

  return (
    <div className="fixed inset-0 z-[1100]" role="dialog" aria-modal aria-label={place.name}>
      <div
        className="absolute inset-0 bg-background/75 backdrop-blur-xl"
        style={{ opacity: out ? 1 : 0, transition: "opacity 700ms ease" }}
        onClick={retract}
      />
      <div
        className="pointer-events-none absolute overflow-hidden shadow-[0_50px_90px_-40px_rgba(40,25,10,.5)]"
        style={{
          left: cx - w / 2,
          top: cy - h / 2,
          width: w,
          height: h,
          opacity: out ? 1 : 0,
          transform: out ? "translate(0,0) scale(1)" : `translate(${fromX}px, ${fromY}px) scale(0.03)`,
          transition: `transform 900ms ${EASE}, opacity 500ms ease`,
        }}
      >
        <PlacePhoto place={place} />
      </div>

      <section
        className={`absolute ${narrow ? "inset-x-0 bottom-0 max-h-[44vh] overflow-y-auto px-6 pb-8" : "right-[8vw] top-1/2 w-[min(36vw,440px)]"}`}
        style={{
          opacity: out ? 1 : 0,
          transform: `${narrow ? "" : "translateY(-50%)"} translateY(${out ? 0 : 16}px)`,
          transition: `opacity 600ms ease ${out ? 260 : 0}ms, transform 900ms ${EASE} ${out ? 260 : 0}ms`,
        }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {place.kind} · Visited {place.visited}
        </p>
        <h2 className="mt-3 font-hand text-[clamp(30px,3.6vw,46px)] font-extralight leading-[1.15]">{place.name}</h2>
        <p className="mt-1 font-hand text-[17px] text-muted-foreground">{place.city}</p>
        <p className="mt-6 font-hand text-[18px] leading-relaxed text-foreground/90">“{place.note}”</p>
        {place.story && <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-foreground/75">{place.story}</p>}
        {!!place.rating && (
          <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
            {"●".repeat(place.rating)}
            <span className="text-foreground/20">{"●".repeat(5 - place.rating)}</span>
            <span className="ml-3 text-muted-foreground">다시 가고 싶은 정도</span>
          </p>
        )}
        <div className="mt-8 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
          {!single && (
            <>
              <button className="rounded-full border border-border px-4 py-2 hover:bg-card" onClick={() => onStep(-1)}>
                ← Previous
              </button>
              <button className="rounded-full border border-border px-4 py-2 hover:bg-card" onClick={() => onStep(1)}>
                Next →
              </button>
            </>
          )}
          <button className="rounded-full bg-foreground px-4 py-2 text-background hover:bg-foreground/85" onClick={retract}>
            Back to map
          </button>
        </div>
      </section>
    </div>
  );
}
