"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
interface Checkpoint { _id: string; cityName: string; country: string; latitude: number; longitude: number; arrivalStatus?: string; sequence: number; }
export interface RouteMapLabels { map: string; recorded: (status: string) => string; planned: string; }
const DEFAULT_LABELS: RouteMapLabels = {
  map: "Map of admin-recorded route checkpoints",
  recorded: status => `Recorded update: ${status}`,
  planned: "Planned checkpoint; no arrival recorded",
};
export function RouteMap({ checkpoints, height = 320, labels = DEFAULT_LABELS }: { checkpoints: Checkpoint[]; height?: number; labels?: RouteMapLabels }) {
  const container = useRef<HTMLDivElement>(null);
  // Popups are built once per map; read labels through a ref so a language change doesn't rebuild the map.
  const labelsRef = useRef(labels);
  useEffect(() => { labelsRef.current = labels; }, [labels]);
  useEffect(() => {
    if (!container.current || !checkpoints.length) return;
    const sorted = [...checkpoints].filter(cp => Number.isFinite(cp.latitude) && Math.abs(cp.latitude) <= 90 && Number.isFinite(cp.longitude) && Math.abs(cp.longitude) <= 180).sort((a,b) => a.sequence-b.sequence);
    if (!sorted.length) return;
    const currentIndex = sorted.findLastIndex(cp => cp.arrivalStatus?.toLowerCase() === "current");
    const lastArrived = sorted.findLastIndex(cp => cp.arrivalStatus?.toLowerCase() === "arrived");
    const recordedIndex = currentIndex >= 0 ? currentIndex : lastArrived;
    const center = sorted[Math.max(0, recordedIndex)];
    const map = new maplibregl.Map({ container: container.current, center: [center.longitude, center.latitude], zoom: 4,
      style: { version: 8, sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>' } }, layers: [{ id: "osm", type: "raster", source: "osm" }] },
    });
    map.on("load", () => {
      if (sorted.length >= 2) {
        map.addSource("planned-route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: sorted.map(cp => [cp.longitude,cp.latitude]) } } });
        map.addLayer({ id: "planned-route", type: "line", source: "planned-route", paint: { "line-color": "#658535", "line-width": 3, "line-dasharray": [3,3] } });
      }
      sorted.forEach((cp,index) => {
        const content = document.createElement("div");
        content.style.cssText = "font:12px system-ui;color:#123d32;padding:4px;max-width:220px";
        const city = document.createElement("strong"); city.textContent = `${cp.cityName}, ${cp.country}`;
        const status = document.createElement("p"); status.textContent = cp.arrivalStatus ? labelsRef.current.recorded(cp.arrivalStatus) : labelsRef.current.planned;
        content.append(city,status);
        new maplibregl.Marker({ color: index === recordedIndex ? "#245b45" : "#82937a" }).setLngLat([cp.longitude,cp.latitude]).setPopup(new maplibregl.Popup({ offset: 25 }).setDOMContent(content)).addTo(map);
      });
      if (sorted.length > 1) {
        const bounds = new maplibregl.LngLatBounds(); sorted.forEach(cp => bounds.extend([cp.longitude,cp.latitude]));
        map.fitBounds(bounds, { padding: 50, maxZoom: 8, duration: 0 });
      }
    });
    return () => map.remove();
  }, [checkpoints]);
  return <div ref={container} aria-label={labels.map} style={{ height, width: "100%", borderRadius: ".75rem", overflow: "hidden" }} />;
}
