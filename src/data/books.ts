export type Book = {
  id: string;
  title: string;
  author: string;
  genres?: string[]; // genre tags shown as filter pills
  cover: string; // real cover art (Open Library URL)
  year: number;
  blurb: string;
  rating: number; // 0 means unrated
  finished: string; // e.g. "Jul 2026"
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

// 샘플 서재. Goodreads CSV를 준비하면 이 배열을 통째로 다시 생성하면 돼요.
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
  spine: string;
  band: string;
};

const seeds: Seed[] = [
  {
    isbn: "9780593135204",
    title: "Project Hail Mary",
    author: "Andy Weir",
    genres: ["Sci-Fi"],
    year: 2021,
    pages: 496,
    publisher: "Ballantine",
    rating: 5,
    finished: "Sep 2026",
    blurb:
      "A lone astronaut wakes up with no memory on a ship light-years from home, and slowly realises he is humanity's last chance — with an unlikely friend.",
    spine: "#1d2a3a",
    band: "#d9a441",
  },
  {
    isbn: "9780062961372",
    title: "Almond",
    author: "Won-pyung Sohn",
    genres: ["Fiction"],
    year: 2017,
    pages: 272,
    publisher: "HarperVia",
    rating: 4,
    finished: "Aug 2026",
    blurb:
      "A boy born unable to feel emotions meets a troubled classmate, and the two change each other in ways neither expected.",
    spine: "#e7dccb",
    band: "#c2452f",
  },
  {
    isbn: "9781455563937",
    title: "Pachinko",
    author: "Min Jin Lee",
    genres: ["Fiction"],
    year: 2017,
    pages: 496,
    publisher: "Grand Central",
    rating: 5,
    finished: "Jul 2026",
    blurb:
      "Four generations of a Korean family in Japan, bound by love, sacrifice and the quiet endurance of people history tried to overlook.",
    spine: "#a83b2c",
    band: "#e6c37a",
  },
  {
    isbn: "9780593318171",
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    genres: ["Fiction", "Sci-Fi"],
    year: 2021,
    pages: 303,
    publisher: "Knopf",
    rating: 4,
    finished: "Jun 2026",
    blurb:
      "An Artificial Friend watches the world from a shop window and learns, slowly and luminously, what it means to love.",
    spine: "#e0b23c",
    band: "#2b2b2b",
  },
  {
    isbn: "9781250301697",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    genres: ["Mystery & Thriller"],
    year: 2019,
    pages: 336,
    publisher: "Celadon",
    rating: 4,
    finished: "May 2026",
    blurb:
      "A famous painter shoots her husband and never speaks another word. A psychotherapist becomes obsessed with making her talk.",
    spine: "#203645",
    band: "#b8c7cf",
  },
  {
    isbn: "9780316556347",
    title: "Circe",
    author: "Madeline Miller",
    genres: ["Fantasy"],
    year: 2018,
    pages: 393,
    publisher: "Little, Brown",
    rating: 5,
    finished: "Apr 2026",
    blurb:
      "The witch of Aiaia tells her own story — exile, gods and monsters, and the slow forging of a self out of mortal courage.",
    spine: "#c4612b",
    band: "#1a1a1a",
  },
  {
    isbn: "9780735211292",
    title: "Atomic Habits",
    author: "James Clear",
    genres: ["Nonfiction"],
    year: 2018,
    pages: 320,
    publisher: "Avery",
    rating: 3,
    finished: "Mar 2026",
    blurb:
      "Tiny changes, remarkable results: a practical framework for building good habits and breaking bad ones.",
    spine: "#f2efe8",
    band: "#d9a33a",
  },
  {
    isbn: "9780062316097",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genres: ["Nonfiction"],
    year: 2011,
    pages: 464,
    publisher: "Harper",
    rating: 4,
    finished: "Feb 2026",
    blurb:
      "A brief history of humankind, from foragers to the scientific revolution — and the stories that let strangers cooperate.",
    spine: "#ece6d8",
    band: "#b23a2a",
  },
  {
    isbn: "9780375704024",
    title: "Norwegian Wood",
    author: "Haruki Murakami",
    genres: ["Fiction", "Romance"],
    year: 1987,
    pages: 296,
    publisher: "Vintage",
    rating: 4,
    finished: "Jan 2026",
    blurb:
      "A Beatles song sends Toru back to Tokyo in the late sixties, to a love divided between two very different women.",
    spine: "#2f4a2d",
    band: "#d7c9a7",
  },
  {
    isbn: "9780441172719",
    title: "Dune",
    author: "Frank Herbert",
    genres: ["Sci-Fi"],
    year: 1965,
    pages: 617,
    publisher: "Ace",
    rating: 5,
    finished: "Dec 2025",
    blurb:
      "On the desert planet Arrakis, a young heir is pulled into a war over the most precious substance in the universe.",
    spine: "#b9752f",
    band: "#3a2416",
  },
  {
    isbn: "9780141439518",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genres: ["Romance", "Fiction"],
    year: 1813,
    pages: 480,
    publisher: "Penguin Classics",
    rating: 5,
    finished: "Nov 2025",
    blurb:
      "Elizabeth Bennet and Mr Darcy misjudge each other spectacularly in the wittiest courtship in English literature.",
    spine: "#8c9c86",
    band: "#e6d6b2",
  },
  {
    isbn: "9780156012195",
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    genres: ["Fiction"],
    year: 1943,
    pages: 96,
    publisher: "Harcourt",
    rating: 5,
    finished: "Oct 2025",
    blurb:
      "A pilot stranded in the desert meets a small prince from another planet. What is essential is invisible to the eye.",
    spine: "#f1e9d2",
    band: "#3b6aa0",
  },
  {
    isbn: "9780547928227",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genres: ["Fantasy"],
    year: 1937,
    pages: 300,
    publisher: "Mariner",
    rating: 4,
    finished: "Sep 2025",
    blurb:
      "Bilbo Baggins is swept out of his comfortable hole and into an adventure with dwarves, a wizard and a dragon.",
    spine: "#3f5a3b",
    band: "#c9a44d",
  },
  {
    isbn: "9780743273565",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genres: ["Fiction"],
    year: 1925,
    pages: 180,
    publisher: "Scribner",
    rating: 3,
    finished: "Aug 2025",
    blurb:
      "Nick Carraway watches his mysterious neighbour chase a green light across the bay, and the Jazz Age glitter around him.",
    spine: "#14213a",
    band: "#e8b44c",
  },
  {
    isbn: "9780451524935",
    title: "1984",
    author: "George Orwell",
    genres: ["Fiction", "Sci-Fi"],
    year: 1949,
    pages: 328,
    publisher: "Signet",
    rating: 4,
    finished: "Jul 2025",
    blurb:
      "Winston Smith rewrites history for the Party, until he begins, dangerously, to think for himself.",
    spine: "#8a2a23",
    band: "#efe7d6",
  },
  {
    isbn: "9780767905923",
    title: "Tuesdays with Morrie",
    author: "Mitch Albom",
    genres: ["Nonfiction"],
    year: 1997,
    pages: 192,
    publisher: "Broadway",
    rating: 0,
    finished: "Jun 2025",
    blurb:
      "A sportswriter reconnects with his dying former professor for a final course, held every Tuesday, on how to live.",
    spine: "#4c2215",
    band: "#7e5741",
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
    s.pages > 420 ? "hardcover" : s.pages < 260 ? "mass" : "paperback";
  const finish: Book["finish"] =
    binding === "hardcover" ? "cloth" : r() > 0.5 ? "gloss" : "matte";
  const height =
    binding === "hardcover"
      ? 236 + r() * 18
      : binding === "mass"
        ? 196 + r() * 14
        : 214 + r() * 16;
  const width = Math.min(58, Math.max(16, s.pages * 0.08 + (r() - 0.5) * 6));
  return {
    id: `${slug(s.title)}-${i}`,
    title: s.title,
    author: s.author,
    genres: s.genres,
    cover: `https://covers.openlibrary.org/b/isbn/${s.isbn}-L.jpg`,
    year: s.year,
    blurb: s.blurb,
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
