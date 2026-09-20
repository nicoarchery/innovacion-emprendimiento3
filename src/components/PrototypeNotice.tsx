import { TriangleAlert } from "lucide-react";

export function PrototypeNotice() {
  return (
    <div className="bg-tinta" role="note" aria-label="Aviso de prototipo">
      <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-2.5 sm:items-center sm:px-6">
        <TriangleAlert
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-300 sm:mt-0"
          aria-hidden="true"
        />
        <p className="text-xs leading-relaxed text-papel/80">
          <span className="mr-2 inline-block rounded-[2px] border border-amber-300/60 px-1.5 py-px font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-300">
            Prototipo
          </span>
          Prototipo en validación. Combinamos registros SECOP II con datos de
          muestra. Verifica cada contrato en SECOP II antes de usarlo en
          decisiones legales o de inversión.
        </p>
      </div>
    </div>
  );
}
