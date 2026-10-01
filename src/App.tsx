import { useCallback, useState, type ReactNode } from "react";
import { ArchiveFilter } from "./components/ArchiveFilter";
import { BookDetail } from "./components/BookDetail";
import { PlaceDetail } from "./components/PlaceDetail";
import { PlaceMap } from "./components/PlaceMap";
import { Shelf, type Rect } from "./components/Shelf";
import { TypedTitle } from "./components/TypedTitle";
import { books, type Book } from "./data/books";
import { places, type Place } from "./data/places";

const bookChips = (b: Book) => b.genres ?? [];
const bookText = (b: Book) => [b.title, b.author, b.blurb, b.publisher];
const placeChips = (p: Place) => [p.kind];
const placeText = (p: Place) => [p.name, p.city, p.note, p.story ?? ""];

// Re-measure an item in the DOM so Previous/Next pull out from the right spot.
function rectOf(selector: string, fallback: Rect): Rect {
  const el = document.querySelector(selector);
  if (!el) return fallback;
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

export default function App() {
  const [shownBooks, setShownBooks] = useState<Book[] | null>(null);
  const [shownPlaces, setShownPlaces] = useState<Place[] | null>(null);
  const [openBook, setOpenBook] = useState<{ i: number; rect: Rect } | null>(null);
  const [openPlace, setOpenPlace] = useState<{ i: number; rect: Rect } | null>(null);

  const bookList = shownBooks ?? books;
  const placeList = shownPlaces ?? places;

  const stepBook = useCallback(
    (dir: -1 | 1) =>
      setOpenBook((o) => {
        if (!o) return o;
        const i = (o.i + dir + bookList.length) % bookList.length;
        return { i, rect: rectOf(`[data-book-id="${bookList[i].id}"]`, o.rect) };
      }),
    [bookList],
  );
  const stepPlace = useCallback(
    (dir: -1 | 1) =>
      setOpenPlace((o) => {
        if (!o) return o;
        const i = (o.i + dir + placeList.length) % placeList.length;
        return { i, rect: rectOf(`[data-place-id="${placeList[i].id}"] svg`, o.rect) };
      }),
    [placeList],
  );

  return (
    <div className="grain relative min-h-screen overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute -left-[20%] -top-[30%] h-[80vh] w-[80vw] animate-drift rounded-full bg-glow opacity-70 blur-[120px]" />
        <div
          className="absolute -right-[10%] top-[40%] h-[60vh] w-[50vw] animate-drift rounded-full bg-primary/10 blur-[120px]"
          style={{ animationDelay: "-9s" }}
        />
      </div>

      <div className="relative z-[2]">
        <header className="mx-auto flex max-w-[1200px] flex-col gap-5 px-6 pb-2 pt-[12vh] sm:px-10">
          <p className="animate-rise font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            A personal archive · 책과 공간
          </p>
          <TypedTitle />
          <nav
            className="flex animate-rise gap-6 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
            style={{ animationDelay: "400ms" }}
          >
            <a href="#books" className="hover:text-foreground">
              <span className="text-foreground">{books.length}</span> {books.length === 1 ? "volume" : "volumes"}
            </a>
            <a href="#spaces" className="hover:text-foreground">
              <span className="text-foreground">{places.length}</span> {places.length === 1 ? "space" : "spaces"}
            </a>
          </nav>
        </header>

        <section id="books" className="scroll-mt-8 pt-14">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 sm:px-10">
            <SectionLabel no="01" title="The Shelf" sub="읽은 책들" />
            <ArchiveFilter
              items={books}
              chipsOf={bookChips}
              textOf={bookText}
              placeholder="What are you looking for?"
              onChange={setShownBooks}
            />
          </div>
          {bookList.length ? (
            <Shelf
              books={bookList}
              openId={openBook ? bookList[openBook.i]?.id : null}
              onOpen={(i, rect) => setOpenBook({ i, rect })}
            />
          ) : (
            <Empty>No books match</Empty>
          )}
        </section>

        <section id="spaces" className="scroll-mt-8 pb-32 pt-24">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 sm:px-10">
            <SectionLabel no="02" title="The Map" sub="다녀온 멋진 공간들" />
            <ArchiveFilter
              items={places}
              chipsOf={placeChips}
              textOf={placeText}
              placeholder="Where did it feel like that?"
              onChange={setShownPlaces}
            />
          </div>
          {placeList.length ? (
            <div className="pt-8">
              <PlaceMap
                places={placeList}
                openId={openPlace ? placeList[openPlace.i]?.id : null}
                onOpen={(i, rect) => setOpenPlace({ i, rect })}
              />
            </div>
          ) : (
            <Empty>No spaces match</Empty>
          )}
        </section>

        <footer className="pb-12 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
          Kept slowly, since 2025
        </footer>
      </div>

      {openBook && bookList[openBook.i] && (
        <BookDetail
          key={bookList[openBook.i].id}
          book={bookList[openBook.i]}
          rect={openBook.rect}
          onClose={() => setOpenBook(null)}
          onStep={stepBook}
          single={bookList.length < 2}
        />
      )}
      {openPlace && placeList[openPlace.i] && (
        <PlaceDetail
          key={placeList[openPlace.i].id}
          place={placeList[openPlace.i]}
          rect={openPlace.rect}
          onClose={() => setOpenPlace(null)}
          onStep={stepPlace}
          single={placeList.length < 2}
        />
      )}
    </div>
  );
}

function SectionLabel({ no, title, sub }: { no: string; title: string; sub: string }) {
  return (
    <div className="flex items-baseline gap-4 border-t border-foreground/10 pt-5">
      <span className="font-mono text-[11px] tracking-[0.2em] text-primary">{no}</span>
      <h2 className="font-display text-[34px] font-light leading-none">{title}</h2>
      <span className="font-hand text-[15px] text-muted-foreground">{sub}</span>
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="py-24 text-center font-display text-2xl italic text-muted-foreground">{children}</p>
  );
}
