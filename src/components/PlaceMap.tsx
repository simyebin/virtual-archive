import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Place } from "../data/places";
import type { Rect } from "./Shelf";

type Props = { places: Place[]; openId: string | null; onOpen: (i: number, rect: Rect) => void };

// A thin sewing pin: a hairline needle with a small glass head, stuck in at a slight angle.
const pinHtml = (name: string) => `
  <span class="pin-shadow"></span>
  <span class="pin-body">
    <svg width="14" height="40" viewBox="0 0 14 40" aria-hidden="true">
      <line x1="7" y1="9" x2="7" y2="40" stroke="var(--pin-needle)" stroke-width="1" stroke-linecap="round" />
      <circle cx="7" cy="6" r="4.2" fill="var(--pin-head)" />
      <circle cx="5.6" cy="4.6" r="1.3" fill="#fff" opacity=".55" />
      <circle class="pin-hit" cx="7" cy="6" r="10" fill="transparent" />
    </svg>
  </span>
  <span class="pin-label">${name.replace(/</g, "&lt;")}</span>`;

// Keep the first view on where most pins are, so one far-away trip doesn't zoom the map out to the whole world.
function homeBounds(places: Place[]) {
  const all = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
  if (places.length < 3) return all;
  const lat = [...places].sort((a, b) => a.lat - b.lat)[Math.floor(places.length / 2)].lat;
  const lng = [...places].sort((a, b) => a.lng - b.lng)[Math.floor(places.length / 2)].lng;
  const near = places.filter((p) => L.latLng(p.lat, p.lng).distanceTo([lat, lng]) < 1_500_000);
  return near.length ? L.latLngBounds(near.map((p) => [p.lat, p.lng])) : all;
}

// Pins that land within a few pixels of each other fan out like a pincushion, so every head stays clickable.
function fanPins(m: L.Map, markers: L.Marker[]) {
  const pts = markers.map((mk) => m.latLngToContainerPoint(mk.getLatLng()));
  const seen = new Set<number>();
  markers.forEach((_, i) => {
    if (seen.has(i)) return;
    const group = [i];
    seen.add(i);
    for (let k = 0; k < group.length; k++)
      pts.forEach((p, j) => {
        if (!seen.has(j) && p.distanceTo(pts[group[k]]) < 22) {
          seen.add(j);
          group.push(j);
        }
      });
    group.sort((a, b) => pts[a].x - pts[b].x);
    const spread = Math.min(26, 13 * (group.length - 1));
    group.forEach((j, n) => {
      const t = group.length === 1 ? 14 : -spread + (2 * spread * n) / (group.length - 1) + 6;
      markers[j].getElement()?.style.setProperty("--tilt", `${t.toFixed(1)}deg`);
    });
  });
}

export function PlaceMap({ places, openId, onOpen }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const open = useRef(onOpen);
  open.current = onOpen;

  useEffect(() => {
    const m = L.map(box.current!, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: false,
      minZoom: 2,
      maxZoom: 17,
      worldCopyJump: true,
    });
    // Esri Light Gray Canvas: already a pale grey, and free to use without an API key.
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      maxNativeZoom: 16,
    }).addTo(m);
    // Scroll-zoom only once the visitor has engaged with the map, so the page still scrolls past it.
    m.on("click", () => m.scrollWheelZoom.enable());
    m.on("mouseout", () => m.scrollWheelZoom.disable());
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current, g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    const markers: L.Marker[] = [];
    places.forEach((p, i) => {
      const marker = L.marker([p.lat, p.lng], {
        icon: L.divIcon({ className: "sewing-pin", html: pinHtml(p.name), iconSize: [14, 40], iconAnchor: [7, 40] }),
        keyboard: true,
        title: `${p.name}, ${p.city}`,
        riseOnHover: true,
      });
      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        const head = marker.getElement()?.querySelector("svg")?.getBoundingClientRect();
        if (head) open.current(i, { left: head.left, top: head.top, width: head.width, height: 12 });
      });
      marker.on("add", () => marker.getElement()?.setAttribute("data-place-id", p.id));
      g.addLayer(marker);
      markers.push(marker);
    });
    if (places.length) m.fitBounds(homeBounds(places), { padding: [70, 70], maxZoom: 12, animate: false });
    const fan = () => fanPins(m, markers);
    fan();
    m.on("zoomend", fan);
    return () => {
      m.off("zoomend", fan);
    };
  }, [places]);

  useEffect(() => {
    box.current?.querySelectorAll<HTMLElement>("[data-place-id]").forEach((el) => {
      el.classList.toggle("is-open", el.dataset.placeId === openId);
    });
  }, [openId, places]);

  return (
    <div className="relative mx-auto max-w-[1200px] px-4 sm:px-10">
      <div ref={box} className="place-map h-[min(68vh,640px)] w-full" aria-label="다녀온 공간 지도" />
      <div className="mt-2 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
        <p>핀을 누르면 사진이 열려요</p>
        <div className="flex items-center gap-3">
          <span className="hidden normal-case tracking-normal text-muted-foreground/60 sm:inline">
            Tiles © Esri — Esri, HERE, Garmin, © OpenStreetMap contributors
          </span>
          {([["+", "확대", 1], ["−", "축소", -1]] as const).map(([label, title, d]) => (
            <button
              key={label}
              type="button"
              title={title}
              aria-label={title}
              onClick={() => map.current?.setZoom(map.current.getZoom() + d)}
              className="grid h-7 w-7 place-items-center rounded-full border border-foreground/15 font-sans text-[15px] font-light text-foreground hover:border-foreground/40"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-right text-[9px] text-muted-foreground/60 sm:hidden">
        Tiles © Esri — Esri, HERE, Garmin, © OpenStreetMap contributors
      </p>
    </div>
  );
}
