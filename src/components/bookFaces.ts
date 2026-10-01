import type { Book } from "../data/books";

// Front-cover depth in un-scaled spine space.
export const COVER_W = 178;

export const faceFont: Record<Book["face"], string> = {
  serif: "font-display",
  sans: "font-sans",
  mono: "font-mono",
};

export const finishSheen: Record<Book["finish"], string> = {
  cloth:
    "linear-gradient(90deg, rgba(0,0,0,.28) 0%, rgba(255,255,255,.08) 22%, rgba(255,255,255,.14) 45%, rgba(0,0,0,.06) 70%, rgba(0,0,0,.32) 100%)",
  gloss:
    "linear-gradient(90deg, rgba(0,0,0,.3) 0%, rgba(255,255,255,.32) 26%, rgba(255,255,255,.05) 40%, rgba(0,0,0,.05) 70%, rgba(0,0,0,.35) 100%)",
  matte:
    "linear-gradient(90deg, rgba(0,0,0,.22) 0%, rgba(255,255,255,.06) 30%, rgba(255,255,255,.08) 50%, rgba(0,0,0,.04) 72%, rgba(0,0,0,.26) 100%)",
};

export const finishTexture: Record<Book["finish"], string> = {
  cloth:
    "repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,.06) 0 1px, transparent 1px 3px)",
  gloss: "none",
  matte:
    "repeating-linear-gradient(45deg, rgba(0,0,0,.035) 0 1px, transparent 1px 4px)",
};
