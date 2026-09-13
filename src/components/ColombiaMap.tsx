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
          <stop offset="0%" stopColor="#d1fae5" />
          <stop offset="100%" stopColor="#f0fdf4" />
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
        stroke="#a7f3d0"
        strokeWidth="2"
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
              <circle
                cx={x}
                cy={y}
                r="16"
                fill="#047857"
                opacity="0.18"
                className="animate-ping"
                style={{ transformOrigin: `${x}px ${y}px` }}
              />
            )}
            <circle cx={x} cy={y} r="14" fill="#ffffff" opacity="0.85" />
            <MapPin
              x={x - 11}
              y={y - 11}
              size={22}
              className={cn(
                "pointer-events-none",
                active ? "text-emerald-700" : "text-slate-400"
              )}
            />
            <text
              x={x}
              y={y + 34}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill={active ? "#065f46" : "#94a3b8"}
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