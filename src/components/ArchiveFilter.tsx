import { useEffect, useMemo, useState } from "react";

type Props<T> = {
  items: T[];
  chipsOf: (item: T) => string[];
  textOf: (item: T) => string[]; // fields to search, most important first
  placeholder: string;
  onChange: (visible: T[] | null) => void;
};

// Client-side search (no AI key needed): ranks by which field matched, then filters by chip.
export function ArchiveFilter<T>({ items, chipsOf, textOf, placeholder, onChange }: Props<T>) {
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<string | null>(null);

  const chips = useMemo(() => {
    const count = new Map<string, number>();
    items.forEach((it) => chipsOf(it).forEach((c) => count.set(c, (count.get(c) ?? 0) + 1)));
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
  }, [items, chipsOf]);

  const result = useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter((t) => t.length >= 1);
    if (!terms.length && !chip) return null;
    let list = items.map((it) => ({ it, score: 0 }));
    if (chip) list = list.filter(({ it }) => chipsOf(it).includes(chip));
    if (terms.length) {
      list = list
        .map(({ it }) => {
          const fields = [...textOf(it), ...chipsOf(it)].map((f) => f.toLowerCase());
          let score = 0;
          for (const t of terms) {
            const idx = fields.findIndex((f) => f.includes(t));
            if (idx === -1) return { it, score: -1 };
            score += fields.length - idx;
          }
          return { it, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score);
    }
    return list.map((x) => x.it);
  }, [q, chip, items, chipsOf, textOf]);

  useEffect(() => onChange(result), [result, onChange]);

  return (
    <div className="flex w-full max-w-[760px] flex-col gap-3">
      <label className="group relative block">
        <span className="sr-only">{placeholder}</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full border-b border-foreground/20 bg-transparent py-2 pr-24 font-display text-[22px] italic text-foreground outline-none transition-colors placeholder:text-foreground/35 focus:border-primary"
        />
        <span className="absolute bottom-3 right-0 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {result ? `${result.length} found` : `${items.length} total`}
        </span>
      </label>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto whitespace-nowrap px-1 pb-1">
        {[null, ...chips].map((c) => {
          const on = chip === c;
          return (
            <button
              key={c ?? "all"}
              type="button"
              onClick={() => setChip(c)}
              aria-pressed={on}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                on
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/15 text-foreground/70 hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {c ?? "All"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
