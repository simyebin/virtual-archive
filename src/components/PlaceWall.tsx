import { useEffect, useState } from "react";
import type { Place } from "../data/places";
import type { Rect } from "./Shelf";

// A soft "light study" painted from the place's tones, used until a real photo is added.
export function PlacePhoto({ place, className = "" }: { place: Place; className?: string }) {
  const [a, b, c] = place.tones;
  if (place.photo)
    return <img src={place.photo.startsWith("/") ? import.meta.env.BASE_URL + place.photo.slice(1) : place.photo} alt={place.name} className={`h-full w-full object-cover ${className}`} draggable={false} />;
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
        style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }}
      />
      <span className="absolute bottom-2 left-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,.45)]">photo soon</span>
    </div>
  );
}

type Props = { places: Place[]; openId: string | null; onOpen: (i: number, rect: Rect) => void };

export function PlaceWall({ places, openId, onOpen }: Props) {
  return (
    <ul className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-5 gap-y-12 px-4 pt-6 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4">
      {places.map((p, i) => (
        <li key={p.id} className="flex justify-center animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
          <button
            type="button"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              onOpen(i, { left: r.left, top: r.top, width: r.width, height: r.height });
            }}
            className="group relative w-full max-w-[250px] cursor-pointer text-left outline-none"
            style={{ ["--tilt" as string]: `${p.tilt}deg`, opacity: openId === p.id ? 0 : 1, transition: "opacity 300ms" }}
            aria-label={`${p.name}, ${p.city}`}
          >
            <figure
              className="relative bg-[#fbf8f2] p-2.5 pb-0 shadow-[0_1px_2px_rgba(60,40,20,.15),0_14px_30px_-18px_rgba(60,40,20,.5)] transition-[transform,box-shadow] duration-[700ms] [transition-timing-function:cubic-bezier(0.22,1,0.32,1)] group-hover:shadow-[0_2px_4px_rgba(60,40,20,.12),0_30px_50px_-24px_rgba(60,40,20,.55)] group-focus-visible:ring-2 group-focus-visible:ring-primary/50"
              style={{ transform: `rotate(var(--tilt))` }}
            >
              <span
                aria-hidden
                className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 bg-[#e9dcc0]/80 shadow-sm"
                style={{ transform: `translateX(-50%) rotate(${-p.tilt * 1.5}deg)`, clipPath: "polygon(3% 0, 97% 4%, 100% 100%, 0 96%)" }}
              />
              <div className="aspect-[4/5] overflow-hidden transition-transform duration-[700ms] group-hover:scale-[1.015]">
                <PlacePhoto place={p} />
              </div>
              <figcaption className="px-1 pb-3 pt-2.5">
                <p className="font-hand text-[16px] leading-snug text-foreground">{p.name}</p>
                <p className="mt-0.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  <span>{p.city}</span>
                  <span>{p.visited}</span>
                </p>
              </figcaption>
            </figure>
          </button>
        </li>
      ))}
    </ul>
  );
}

type DetailProps = { place: Place; rect: Rect; onClose: () => void; onStep: (dir: -1 | 1) => void };

export function PlaceDetail({ place, rect, onClose, onStep }: DetailProps) {
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
      if (e.key === "ArrowLeft") onStep(-1);
      if (e.key === "ArrowRight") onStep(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const narrow = vp.w < 720;
  const targetH = narrow ? vp.h * 0.5 : Math.min(vp.h * 0.74, 640);
  const scale = targetH / rect.height;
  const tx = (narrow ? vp.w / 2 : vp.w * 0.34) - (rect.left + rect.width / 2);
  const ty = (narrow ? 24 + targetH / 2 : vp.h / 2) - (rect.top + rect.height / 2);
  const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal aria-label={place.name}>
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-xl"
        style={{ opacity: out ? 1 : 0, transition: "opacity 700ms ease" }}
        onClick={retract}
      />
      <figure
        className="pointer-events-none absolute bg-[#fbf8f2] p-2.5 pb-0 shadow-[0_40px_80px_-30px_rgba(40,25,10,.55)]"
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          transformOrigin: "center",
          transform: out ? `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${place.tilt * -0.3}deg)` : `rotate(${place.tilt}deg)`,
          transition: `transform 900ms ${EASE}`,
        }}
      >
        <div className="aspect-[4/5] overflow-hidden">
          <PlacePhoto place={place} />
        </div>
        <figcaption className="px-1 pb-3 pt-2.5">
          <p className="font-hand text-[16px] leading-snug">{place.name}</p>
          <p className="mt-0.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            <span>{place.city}</span>
            <span>{place.visited}</span>
          </p>
        </figcaption>
      </figure>

      <section
        className={`absolute ${narrow ? "inset-x-0 bottom-0 max-h-[44vh] overflow-y-auto px-6 pb-8" : "right-[8vw] top-1/2 w-[min(38vw,460px)]"}`}
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
        <p className="mt-1 font-display text-xl italic text-muted-foreground">{place.city}</p>
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
          <button className="rounded-full border border-border px-4 py-2 hover:bg-card" onClick={() => onStep(-1)}>
            ← Previous
          </button>
          <button className="rounded-full border border-border px-4 py-2 hover:bg-card" onClick={() => onStep(1)}>
            Next →
          </button>
          <button className="rounded-full bg-foreground px-4 py-2 text-background hover:bg-foreground/85" onClick={retract}>
            Pin it back
          </button>
        </div>
      </section>
    </div>
  );
}
