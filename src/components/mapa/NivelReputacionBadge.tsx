import { Stamp } from "@/components/Stamp";
import {
  nivelReputacionDato,
  type NivelReputacion,
} from "@/components/mapa/reportes-comunes";

export interface NivelReputacionBadgeProps {
  nivel: NivelReputacion;
  className?: string;
}

export function NivelReputacionBadge({ nivel, className }: NivelReputacionBadgeProps) {
  const dato = nivelReputacionDato(nivel);
  return (
    <Stamp tone={dato.tone} className={className}>
      {dato.label}
    </Stamp>
  );
}