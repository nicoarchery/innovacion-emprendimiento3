"use client";

import { useState } from "react";
import { Building2, Loader2, Pin, PinOff, Send, Star } from "lucide-react";
import { Stamp } from "@/components/Stamp";
import { useToast } from "@/hooks/use-toast";
import {
  formatearFecha,
  type RespuestaFila,
} from "@/components/mapa/reportes-comunes";

interface HiloRespuestasProps {
  idReporte: number;
  respuestas: RespuestaFila[];
  onCambio: () => void;
}

const MAX_TEXTO_RESPUESTA = 2000;

export function HiloRespuestas({ idReporte, respuestas, onCambio }: HiloRespuestasProps) {
  const { toast } = useToast();
  const [abierto, setAbierto] = useState(false);
  const [autor, setAutor] = useState("");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [fijando, setFijando] = useState<number | null>(null);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) {
      toast({
        variant: "destructive",
        title: "Escribe una respuesta",
        description: "El texto de la respuesta no puede ir vacío.",
      });
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch(`/api/mapa/reportes/${idReporte}/respuestas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autor: autor.trim() || null, texto: texto.trim() }),
      });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !json.success) throw new Error(json.error ?? "Error desconocido");
      toast({ title: "Respuesta registrada" });
      setTexto("");
      setAutor("");
      setAbierto(true);
      onCambio();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "No se pudo registrar la respuesta",
        description: (error as Error).message,
      });
    } finally {
      setEnviando(false);
    }
  };

  const alternarFijada = async (r: RespuestaFila) => {
    setFijando(r.id);
    try {
      const res = await fetch(`/api/mapa/respuestas/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fijar: !r.fijada, desfijar: r.fijada }),
      });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !json.success) throw new Error(json.error ?? "Error desconocido");
      toast({
        title: r.fijada ? "Respuesta desfijada" : "Respuesta fijada como oficial",
      });
      onCambio();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "No se pudo actualizar la respuesta",
        description: (error as Error).message,
      });
    } finally {
      setFijando(null);
    }
  };

  const fijadas = respuestas.filter((r) => r.fijada);
  const resto = respuestas.filter((r) => !r.fijada);

  return (
    <div className="mt-3 rounded-[4px] border border-tinta/15 bg-papel/80">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-sello">
          <Building2 className="h-3.5 w-3.5" />
          {fijadas.length > 0 ? (
            <>
              Respuesta oficial <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            </>
          ) : (
            <>
              Respuestas de la empresa ({respuestas.length}) · Responder
            </>
          )}
        </span>
        <span className="font-mono text-[11px] text-tinta/45">
          {abierto ? "ocultar" : "ver"}
        </span>
      </button>

      {abierto && (
        <div className="space-y-2 border-t border-tinta/10 px-3 py-2">
          {fijadas.map((r) => (
            <div key={r.id} className="rounded-[3px] border border-amber-700/40 bg-amber-50/80 p-2">
              <div className="flex items-center gap-1.5">
                <Stamp tone="verificado">Oficial fijada</Stamp>
                <span className="ml-auto font-mono text-[10px] text-tinta/45">
                  {formatearFecha(r.fecha)}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-tinta">{r.autor ?? "Empresa"}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-tinta/85">{r.texto}</p>
              <DesfijarBtn fijando={fijando === r.id} onDesfijar={() => void alternarFijada(r)} />
            </div>
          ))}

          {resto.map((r) => (
            <div key={r.id} className="rounded-[3px] border border-tinta/15 bg-ficha p-2">
              <div className="flex items-center gap-1.5">
                {r.esOficial ? (
                  <Stamp tone="verificado">Oficial</Stamp>
                ) : (
                  <Stamp tone="neutro">Empresa</Stamp>
                )}
                <span className="ml-auto font-mono text-[10px] text-tinta/45">
                  {formatearFecha(r.fecha)}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-tinta">{r.autor ?? "Empresa"}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-tinta/85">{r.texto}</p>
              <FijarBtn fijando={fijando === r.id} onFijar={() => void alternarFijada(r)} />
            </div>
          ))}

          <form onSubmit={enviar} className="mt-2 space-y-2 border-t border-tinta/10 pt-2">
            <input
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              placeholder="Nombre de la empresa / NIT"
              maxLength={120}
              className="w-full rounded-[3px] border border-tinta/20 bg-white px-2 py-1.5 text-xs text-tinta focus:ring-0"
            />
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Descargo o aclaración oficial de la empresa sobre este reporte…"
              rows={2}
              maxLength={MAX_TEXTO_RESPUESTA}
              className="w-full rounded-[3px] border border-tinta/20 bg-white px-2 py-1.5 text-xs text-tinta focus:ring-0"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-tinta/40">
                {texto.length}/{MAX_TEXTO_RESPUESTA}
              </span>
              <button
                type="submit"
                disabled={enviando}
                className="inline-flex items-center gap-1.5 rounded-[3px] bg-sello px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-tinta disabled:opacity-60"
              >
                {enviando ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {enviando ? "Enviando…" : "Responder como empresa"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function FijarBtn({ onFijar, fijando }: { onFijar: () => void; fijando: boolean }) {
  if (fijando) {
    return (
      <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-tinta/45">
        <Loader2 className="h-3 w-3 animate-spin" /> Actualizando…
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onFijar}
      className="mt-1.5 inline-flex items-center gap-1 rounded-[3px] border border-amber-700/40 bg-white px-2 py-1 text-[11px] font-medium text-amber-800 transition-colors hover:bg-amber-50"
    >
      <Pin className="h-3 w-3" />
      Fijar como oficial
    </button>
  );
}

function DesfijarBtn({ onDesfijar, fijando }: { onDesfijar: () => void; fijando: boolean }) {
  return (
    <button
      type="button"
      onClick={onDesfijar}
      disabled={fijando}
      className="mt-1.5 inline-flex items-center gap-1 rounded-[3px] border border-tinta/20 bg-white px-2 py-1 text-[11px] font-medium text-tinta/70 transition-colors hover:bg-papel disabled:opacity-60"
    >
      <PinOff className="h-3 w-3" />
      Quitar fijado
    </button>
  );
}