export type Book = {
  id: string;
  title: string;
  author: string;
  genres?: string[]; // genre tags shown as filter pills
  cover: string; // real cover art (Open Library URL)
  year: number;
  blurb: string;
  note?: string; // my own words about the book
  bookmarks?: number;
  rating: number; // 0 means unrated
  finished: string; // e.g. "Jul 2026", "" if unknown
  recommender?: string;
  publisher: string;
  binding: "hardcover" | "paperback" | "mass";
  finish: "cloth" | "gloss" | "matte"; // spine surface material
  spine: string; // base color, sampled from the cover's left edge
  band?: string; // accent pulled from the cover art
  ink: string; // lettering color
  face: "serif" | "sans" | "mono";
  caps?: boolean;
  width: number; // spine width in px
  height: number; // spine height in px
  lean: number; // degrees of lean on the shelf
  depth: number; // how far forward/back the book sits, px
  wear: number; // 0–1 edge wear and ink fade
  spineImage?: string;
};

// 내 서재. 책을 추가할 때는 seeds 배열에 한 권씩 넣으면 돼요.
// (spine/band/ink는 기본값이고, 화면에서는 표지 왼쪽 가장자리 색을 다시 샘플링해 덮어씁니다.)
type Seed = {
  isbn: string;
  title: string;
  author: string;
  genres: string[];
  year: number;
  pages: number;
  publisher: string;
  rating: number;
  finished: string;
  blurb: string;
  note?: string; // 나의 감상
  bookmarks?: number;
  binding?: Book["binding"]; // 실제 제본을 알면 직접 지정
  cover?: string; // public/ 기준 경로 또는 URL. 없으면 Open Library에서 ISBN으로 찾음
  spine: string;
  band: string;
};

const seeds: Seed[] = [
  {
    isbn: "9791193383193",
    title: "일의 감각",
    author: "조수용",
    genres: ["에세이", "일과 브랜딩"],
    year: 2024,
    pages: 263,
    publisher: "REFERENCE BY B",
    binding: "hardcover",
    cover: "covers/work-and-sense.jpg",
    rating: 0,
    finished: "",
    bookmarks: 18,
    blurb:
      "좋은 감각을 지니려면, 디자인을 잘하려면, 더 나은 브랜드를 만들려면 어떻게 해야 하는가. ‘일’하는 사람의 섬세한 ‘감각’ 탐구, 조수용의 첫 단독 에세이.",
    note:
      "서촌으로 혼자 여행 갔다가 어떤 이유에서인지 마음이 갔다. 가벼이 골랐지만 결국 나는 아끼고 아끼는 책이 되었다. 나의 두근거림을 다시 일깨워준 책, 일을 할 때의 마음가짐부터 시작하여 스스로 어느 정도까지 양보해야 하는지 일침을 가하는 책이다. 아이러니하게도 감각을 알기 위해서 읽은 책이지만, 나는 일을 더 하고 싶다는 마음을 얻은 책이기도 하다. 유일하게 북마크가 18개나 된다.",
    spine: "#cf8219",
    band: "#d24b12",
  },
];

// Deterministic per-book variation so the shelf looks lived-in.
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const faces = ["serif", "sans", "mono"] as const;

function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.55;
}

export function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 28);
}

export const books: Book[] = seeds.map((s, i) => {
  const r = hash(s.isbn);
  const binding: Book["binding"] =
    s.binding ??
    (s.pages > 420 ? "hardcover" : s.pages < 260 ? "mass" : "paperback");
  const finish: Book["finish"] =
    binding === "hardcover" ? "cloth" : r() > 0.5 ? "gloss" : "matte";
  const height =
    binding === "hardcover"
      ? 236 + r() * 18
      : binding === "mass"
        ? 196 + r() * 14
        : 214 + r() * 16;
  const width = Math.min(58, Math.max(26, s.pages * 0.08 + (r() - 0.5) * 6));
  return {
    id: `${slug(s.title)}-${i}`,
    title: s.title,
    author: s.author,
    genres: s.genres,
    cover: s.cover
      ? s.cover.startsWith("http")
        ? s.cover
        : import.meta.env.BASE_URL + s.cover
      : `https://covers.openlibrary.org/b/isbn/${s.isbn}-L.jpg`,
    year: s.year,
    blurb: s.blurb,
    note: s.note,
    bookmarks: s.bookmarks,
    rating: s.rating,
    finished: s.finished,
    publisher: s.publisher,
    binding,
    finish,
    spine: s.spine,
    band: s.band,
    ink: isLight(s.spine) ? "#241f19" : "#faf7f0",
    face: faces[Math.floor(r() * 3)],
    caps: r() > 0.6,
    width: Math.round(width),
    height: Math.round(height),
    lean: r() > 0.78 ? -Math.round(r() * 50) / 10 : 0,
    depth: Math.round((r() * 14 - 7) * 10) / 10,
    wear: Math.round(r() * 35) / 100,
  };
});
