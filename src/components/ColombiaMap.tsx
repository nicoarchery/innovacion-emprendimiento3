"use client";

import { MapPin } from "lucide-react";

import type { Municipality } from "@/lib/data";
import { MAP_POSITIONS } from "@/lib/data";
import { cn } from "@/lib/utils";

type ColombiaMapProps = {
  selected?: Municipality | "Todos";
  counts: Record<string, number>;
  onSelectMunicipality: (municipality: Municipality) => void;
};

export function ColombiaMap({
  selected,
  counts,
  onSelectMunicipality,
}: ColombiaMapProps) {
  const municipalities = Object.keys(MAP_POSITIONS) as Municipality[];

  return (
    <svg
      viewBox="0 0 320 280"
      role="img"
      aria-label="Mapa de Colombia con proyectos ubicados por municipio"
      className="h-auto w-full"
    >
      <defs>
        <linearGradient id="colombia-shape" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eef1f7" />
          <stop offset="100%" stopColor="#f7f5ef" />
        </linearGradient>
      </defs>

      <path
        d="M 108 28
           C 128 12, 168 8, 198 12
           C 226 16, 252 18, 278 38
           C 300 54, 318 76, 314 104
           C 310 132, 296 148, 288 168
           C 282 184, 262 206, 246 218
           C 236 226, 224 240, 208 238
           C 190 236, 178 224, 162 214
           C 144 202, 128 196, 108 188
           C 86 178, 78 156, 74 132
           C 70 108, 78 86, 88 68
           C 96 52, 100 38, 108 28 Z"
        fill="url(#colombia-shape)"
        stroke="#1a2744"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />

      {municipalities.map((municipality) => {
        const { x, y } = MAP_POSITIONS[municipality];
        const active = selected === municipality || selected === "Todos";
        return (
          <g
            key={municipality}
            className="cursor-pointer"
            onClick={() => onSelectMunicipality(municipality)}
          >
            {active && (
              <circle cx={x} cy={y} r="14" fill="#1e40af" opacity="0.14" />
            )}
            <circle
              cx={x}
              cy={y}
              r="14"
              fill="#ffffff"
              opacity="0.85"
              stroke={active ? "#1e40af" : "#1a2744"}
              strokeOpacity={active ? 0.6 : 0.2}
            />
            <MapPin
              x={x - 11}
              y={y - 11}
              size={22}
              className={cn(
                "pointer-events-none",
                active ? "text-sello" : "text-tinta/35"
              )}
            />
            <text
              x={x}
              y={y + 34}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill={active ? "#1e40af" : "#1a2744"}
              opacity={active ? 1 : 0.45}
            >
              {municipality}
              {counts[municipality] ? ` · ${counts[municipality]}` : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}