import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-tinta text-papel/75">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <p className="font-display text-2xl font-bold text-papel">
              Obras a la Vista
            </p>
            <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-papel/50">
              Santiago de Cali · Consulta ciudadana
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              Contratos SECOP II en un mapa. Reconocimiento para quien
              cumple. Ubicaciones aproximadas.
            </p>
          </div>

          <a
            href="/mapa"
            className="inline-flex items-center gap-2 rounded-[3px] bg-papel/10 px-5 py-2.5 text-sm font-semibold text-papel transition-colors hover:bg-papel/20"
          >
            <ExternalLink className="h-4 w-4" />
            Ver el mapa de obras
          </a>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-papel/15 pt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-papel/45 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} · Prototipo en validación</span>
          <span>Fuente: SECOP II · datos.gov.co</span>
        </div>
      </div>
    </footer>
  );
}
