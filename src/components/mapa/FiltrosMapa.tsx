import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";
import type { FiltrosMapaUI } from "@/components/mapa/mapa-types";

interface FiltrosMapaProps {
  filtros: FiltrosMapaUI;
  estados: string[];
  entidades: string[];
  onCambio: (filtros: FiltrosMapaUI) => void;
  onAplicar: () => void;
  onLimpiar: () => void;
}

export function FiltrosMapa({
  filtros,
  estados,
  entidades,
  onCambio,
  onAplicar,
  onLimpiar,
}: FiltrosMapaProps) {
  return (
    <div className="rounded-[4px] border border-tinta/20 bg-ficha p-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div className="space-y-1">
          <Label htmlFor="filtro-estado" className="text-[11px] font-semibold uppercase tracking-wide text-tinta/55">
            Estado
          </Label>
          <Select
            id="filtro-estado"
            value={filtros.estado}
            onChange={(e) => onCambio({ ...filtros, estado: e.target.value })}
          >
            <option value="todos">Todos</option>
            {estados.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="filtro-entidad" className="text-[11px] font-semibold uppercase tracking-wide text-tinta/55">
            Entidad
          </Label>
          <Select
            id="filtro-entidad"
            value={filtros.entidad}
            onChange={(e) => onCambio({ ...filtros, entidad: e.target.value })}
          >
            <option value="todos">Todas</option>
            {entidades.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="filtro-min" className="text-[11px] font-semibold uppercase tracking-wide text-tinta/55">
            Valor mín. (COP)
          </Label>
          <Input
            id="filtro-min"
            type="number"
            placeholder="0"
            min={0}
            value={filtros.minValor}
            onChange={(e) => onCambio({ ...filtros, minValor: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="filtro-max" className="text-[11px] font-semibold uppercase tracking-wide text-tinta/55">
            Valor máx. (COP)
          </Label>
          <Input
            id="filtro-max"
            type="number"
            placeholder="∞"
            min={0}
            value={filtros.maxValor}
            onChange={(e) => onCambio({ ...filtros, maxValor: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="filtro-fecha" className="text-[11px] font-semibold uppercase tracking-wide text-tinta/55">
            Año de firma
          </Label>
          <Select
            id="filtro-fecha"
            value={filtros.fecha}
            onChange={(e) => onCambio({ ...filtros, fecha: e.target.value })}
          >
            <option value="todos">Todos</option>
            {["2026", "2025", "2024", "2023", "2022", "2021", "2020"].map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button size="sm" onClick={onAplicar}>
            Aplicar
          </Button>
          <Button size="sm" variant="outline" onClick={onLimpiar} aria-label="Limpiar filtros">
            <FilterX className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}