import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterX, Search } from "lucide-react";
import { AyudaEstados } from "@/components/mapa/AyudaEstados";
import type { FiltrosMapaUI } from "@/components/mapa/mapa-types";

interface FiltrosMapaProps {
  filtros: FiltrosMapaUI;
  estados: string[];
  entidades: string[];
  aniosInicio: string[];
  aniosFin: string[];
  onCambio: (filtros: FiltrosMapaUI) => void;
  onAplicar: () => void;
  onLimpiar: () => void;
}

export function FiltrosMapa({
  filtros,
  estados,
  entidades,
  aniosInicio,
  aniosFin,
  onCambio,
  onAplicar,
  onLimpiar,
}: FiltrosMapaProps) {
  return (
    <div className="rounded-[4px] border border-tinta/20 bg-ficha p-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <div className="col-span-2 md:col-span-3 lg:col-span-2">
          <div className="space-y-1">
            <Label
              htmlFor="filtro-busqueda"
              className="text-[11px] font-semibold uppercase tracking-wide text-tinta/55"
            >
              Buscar
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-tinta/40" />
              <Input
                id="filtro-busqueda"
                placeholder="Obra, contratista, entidad, barrio o comuna…"
                value={filtros.busqueda}
                onChange={(e) => onCambio({ ...filtros, busqueda: e.target.value })}
                className="pl-8 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="filtro-estado"
            className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-tinta/55"
          >
            Estado
            <AyudaEstados estados={estados} />
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
          <Label
            htmlFor="filtro-entidad"
            className="text-[11px] font-semibold uppercase tracking-wide text-tinta/55"
          >
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
          <Label
            htmlFor="filtro-min"
            className="text-[11px] font-semibold uppercase tracking-wide text-tinta/55"
          >
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
          <Label
            htmlFor="filtro-max"
            className="text-[11px] font-semibold uppercase tracking-wide text-tinta/55"
          >
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
          <Label
            htmlFor="filtro-inicio"
            className="text-[11px] font-semibold uppercase tracking-wide text-tinta/55"
          >
            Año de inicio
          </Label>
          <Select
            id="filtro-inicio"
            value={filtros.fechaInicio}
            onChange={(e) => onCambio({ ...filtros, fechaInicio: e.target.value })}
          >
            <option value="todos">Todos</option>
            {aniosInicio.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="filtro-fin"
            className="text-[11px] font-semibold uppercase tracking-wide text-tinta/55"
          >
            Año de fin
          </Label>
          <Select
            id="filtro-fin"
            value={filtros.fechaFin}
            onChange={(e) => onCambio({ ...filtros, fechaFin: e.target.value })}
          >
            <option value="todos">Todos</option>
            {aniosFin.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 border-t border-tinta/10 pt-3">
        <Button size="sm" variant="outline" onClick={onLimpiar} aria-label="Limpiar filtros">
          <FilterX className="h-4 w-4" />
        </Button>
        <Button size="sm" onClick={onAplicar}>
          Aplicar
        </Button>
      </div>
    </div>
  );
}