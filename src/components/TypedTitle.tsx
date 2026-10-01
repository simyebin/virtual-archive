import { useEffect, useState } from "react";

const FULL = "Welcome to my archive";

export function TypedTitle() {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= FULL.length) return;
    const t = setTimeout(() => setN(n + 1), 95);
    return () => clearTimeout(t);
  }, [n]);
  const done = n >= FULL.length;
  return (
    <h1
      aria-label={FULL}
      className="font-display text-[clamp(40px,7vw,84px)] font-light italic leading-[1.02] tracking-[-0.01em] text-foreground"
    >
      <span aria-hidden>
        {FULL.slice(0, n)}
        <span
          className={`ml-1 inline-block h-[0.8em] w-[2px] translate-y-[0.08em] bg-primary/70 ${done ? "animate-caret" : ""}`}
        />
      </span>
    </h1>
  );
}
