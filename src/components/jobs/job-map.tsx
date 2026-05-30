"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface MapPin {
  lat: number;
  lng: number;
  label: string;
}

interface JobMapProps {
  pins: MapPin[];
  /** Zoom level. Defaults to single-pin: 13, multi-pin: auto-fit */
  zoom?: number;
}

export function JobMap({ pins, zoom }: JobMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || pins.length === 0) return;

    // Dynamic import to ensure this only runs client-side
    let mapInstance: import("leaflet").Map | null = null;

    import("leaflet").then((L) => {
      if (!containerRef.current) return;

      // Prevent double-init if effect runs twice (React strict mode)
      if ((containerRef.current as HTMLElement & { _leaflet_id?: number })._leaflet_id) return;

      const map = L.map(containerRef.current, { scrollWheelZoom: false });
      mapInstance = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      pins.forEach((pin) => {
        // Use CircleMarker to avoid the broken default Leaflet icon issue
        const marker = L.circleMarker([pin.lat, pin.lng], {
          radius: 10,
          color: "#412473",
          fillColor: "#6a3fc6",
          fillOpacity: 0.85,
          weight: 2,
        }).addTo(map);

        if (pin.label) {
          marker.bindPopup(pin.label);
        }
      });

      if (pins.length === 1) {
        map.setView([pins[0].lat, pins[0].lng], zoom ?? 13);
      } else {
        const bounds = L.latLngBounds(pins.map((p) => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      mapInstance?.remove();
    };
  }, [pins, zoom]);

  if (pins.length === 0) return null;

  return (
    <figure className="m-0">
      <figcaption className="sr-only">
        {`Map showing ${pins.length} location${pins.length !== 1 ? "s" : ""}: ${pins
          .map((p) => p.label)
          .join(", ")}`}
      </figcaption>
      <div
        ref={containerRef}
        className="h-64 w-full overflow-hidden rounded-xl border border-border"
      />
    </figure>
  );
}
