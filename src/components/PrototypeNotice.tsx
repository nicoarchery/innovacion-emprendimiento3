import { TriangleAlert } from "lucide-react";

export function PrototypeNotice() {
  return (
    <div className="bg-slate-900" role="note" aria-label="Aviso de prototipo">
      <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3 sm:items-center sm:px-6">
        <TriangleAlert
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-400 sm:mt-0"
          aria-hidden="true"
        />
        <p className="text-xs leading-relaxed text-slate-300">
          <span className="mr-1 inline-block rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-900">
            Prototipo
          </span>
          Esta plataforma es un prototipo en fase de validación. Los contratos,
          porcentajes de avance, evidencias de campo y alertas mostrados
          provienen parcialmente de fuentes públicas (SECOP II) y parcialmente
          de datos simulados o estimados con fines demostrativos. Esta
          información NO constituye información oficial ni debe utilizarse para
          tomar decisiones legales, contractuales o de inversión.
        </p>
      </div>
    </div>
  );
}