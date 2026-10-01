import { useEffect, useState } from "react";
import type { Book } from "../data/books";

export type Palette = { spine: string; band: string; ink: string };

const cache = new Map<string, Promise<Palette | null>>();

const hex = (r: number, g: number, b: number) =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

// Samples the cover's left 6% into `spine`, the most saturated mid-luminance pixel into `band`.
export function readCoverPalette(src: string): Promise<Palette | null> {
  const hit = cache.get(src);
  if (hit) return hit;
  const p = new Promise<Palette | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const w = 80;
        const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        if (img.naturalWidth < 10) return resolve(null); // Open Library 1px placeholder

        const edgeW = Math.max(1, Math.round(w * 0.06));
        let r = 0, g = 0, b = 0, n = 0;
        let best = { s: -1, r: 0, g: 0, b: 0 };
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const R = data[i], G = data[i + 1], B = data[i + 2];
            if (x < edgeW) {
              r += R; g += G; b += B; n++;
            }
            const max = Math.max(R, G, B), min = Math.min(R, G, B);
            const l = (max + min) / 510;
            const s = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
            if (l > 0.25 && l < 0.75 && s > best.s) best = { s, r: R, g: G, b: B };
          }
        }
        r /= n; g /= n; b /= n;
        const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        resolve({
          spine: hex(r, g, b),
          band: hex(best.r, best.g, best.b),
          ink: lum > 0.55 ? "#241f19" : "#faf7f0",
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
  cache.set(src, p);
  return p;
}

// Returns the book with its colours re-sampled from the real cover once it loads.
export function useSampledBook(book: Book): Book {
  const [pal, setPal] = useState<Palette | null>(null);
  useEffect(() => {
    let live = true;
    if (book.cover) readCoverPalette(book.cover).then((p) => live && setPal(p));
    return () => {
      live = false;
    };
  }, [book.cover]);
  return pal ? { ...book, ...pal } : book;
}
