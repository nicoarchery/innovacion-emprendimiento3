"use client";

import { useCallback, useEffect, useState } from "react";
import { Camera, CheckCircle2, MapPin, Star, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { ObraMarcador } from "@/components/mapa/mapa-types";

interface ReporteCiudadanoModalProps {
  obra: ObraMarcador;
  onClose: () => void;
  onEnviado: () => void;
}

const MAX_FOTO_BYTES = 1_500_000;

export function ReporteCiudadanoModal({
  obra,
  onClose,
  onEnviado,
}: ReporteCiudadanoModalProps) {
  const { toast } = useToast();
  const [estadoTerreno, setEstadoTerreno] = useState("ejecucion");
  const [avanceObservado, setAvanceObservado] = useState(50);
  const [calificacion, setCalificacion] = useState(0);
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [contacto, setContacto] = useState("");
  const [gps, setGps] = useState<{ lat: number; lon: number; origen: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pedirGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGps({ lat: obra.lat ?? 0, lon: obra.lon ?? 0, origen: "obra" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setGps({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          origen: "navegador",
        }),
      () =>
        setGps({
          lat: obra.lat ?? 0,
          lon: obra.lon ?? 0,
          origen: "obra",
        }),
      { timeout: 5000, maximumAge: 60_000 }
    );
  }, [obra.lat, obra.lon]);

  useEffect(() => {
    const timer = setTimeout(() => pedirGps(), 0);
    return () => clearTimeout(timer);
  }, [pedirGps]);

  const onFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (archivo.size > MAX_FOTO_BYTES) {
      e.target.value = "";
      toast({
        variant: "destructive",
        title: "Foto demasiado grande",
        description: "Máximo 1.5 MB. Prueba con una foto más ligera.",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFoto(String(reader.result));
    reader.readAsDataURL(archivo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/mapa/obras/${obra.id}/reportes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estadoTerreno,
          avanceObservado,
          calificacion,
          descripcion: descripcion.trim() || null,
          foto,
          contacto: contacto.trim() || null,
          lat: gps?.lat,
          lon: gps?.lon,
          gpsOrigen: gps?.origen,
        }),
      });
      const json = (await res.json()) as {
        success: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Error desconocido");
      }
      toast({
        title: "Reporte enviado",
        description: json.message ?? "Gracias por aportar.",
      });
      onEnviado();
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "No se pudo enviar el reporte",
        description: (error as Error).message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-sello">
            <Star className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Reporte ciudadano
            </span>
          </div>
          <DialogTitle className="text-xl font-bold leading-tight text-tinta">
            ¿Y tú cómo la ves?
          </DialogTitle>
          <DialogDescription className="line-clamp-2 text-sm text-tinta/65">
            {obra.nombre ?? obra.entidad ?? "Obra sin descripción"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-2 rounded-[4px] border border-tinta/20 bg-papel p-3 text-xs text-tinta/75">
            <div>
              <span className="block text-tinta/55">Ubicación</span>
              <span className="flex items-center gap-1 font-semibold">
                <MapPin className="h-3.5 w-3.5 text-green-700" />
                {gps?.origen === "navegador"
                  ? "Tu GPS actual"
                  : obra.barrio ?? obra.comuna ?? "Cali"}
              </span>
            </div>
            <div>
              <span className="block text-tinta/55">Contrato</span>
              <span className="font-mono text-xs text-tinta/70">{obra.id}</span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-tinta/75">
              Estado que ves en terreno
            </Label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {[
                { id: "ejecucion", label: "En ejecución" },
                { id: "retraso", label: "Con retraso" },
                { id: "paralizada", label: "Paralizada" },
              ].map((st) => (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => setEstadoTerreno(st.id)}
                  className={`rounded-md border py-1.5 text-center text-xs font-medium transition-colors ${
                    estadoTerreno === st.id
                      ? "border-sello bg-sello text-white"
                      : "border-tinta/20 bg-white text-tinta/75 hover:bg-papel"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <Label htmlFor="avance" className="text-xs font-medium text-tinta/75">
                Avance que ves en terreno
              </Label>
              <span className="rounded border border-green-700/30 bg-green-50 px-2 py-0.5 text-sm font-bold text-sello">
                {avanceObservado}%
              </span>
            </div>
            <input
              id="avance"
              type="range"
              min="0"
              max="100"
              step="5"
              value={avanceObservado}
              onChange={(e) => setAvanceObservado(parseInt(e.target.value, 10))}
              className="w-full cursor-pointer accent-sello"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-tinta/75">
              ¿Cómo calificas la gestión de esta obra?
            </Label>
            <div className="mt-1 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCalificacion(n)}
                  aria-label={`${n} de 5`}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      n <= calificacion
                        ? "fill-amber-400 text-amber-400"
                        : "text-tinta/25"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="descripcion" className="text-xs font-medium text-tinta/75">
              Tu opinión / lo que viste
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Ej. sin maquinaria hace una semana, material abandonado, falta señalización…"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="mt-1 text-xs"
            />
          </div>

          <div className="flex flex-col justify-between gap-3 rounded-[4px] border border-dashed border-tinta/25 bg-papel p-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] bg-green-100 text-sello">
                {foto ? (
                  <CheckCircle2 className="h-4 w-4 text-green-700" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-tinta/85">
                  Foto opcional de la obra
                </p>
                <p className="text-[11px] text-tinta/55">
                  Adjunta una imagen de cómo está hoy (máx. 1.5 MB).
                </p>
              </div>
            </div>
            <label
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors ${
                foto
                  ? "border-sello bg-green-50 text-sello"
                  : "border-tinta/25 text-tinta/75 hover:bg-white"
              }`}
            >
              {foto ? (
                <>
                  <Upload className="h-3.5 w-3.5 text-green-700" />
                  Foto adjunta
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Subir foto
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFoto}
              />
            </label>
          </div>

          <div>
            <Label htmlFor="contacto" className="text-xs font-medium text-tinta/75">
              Contacto (opcional, para confirmar tu reporte)
            </Label>
            <Input
              id="contacto"
              placeholder="Correo o teléfono"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              className="mt-1"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-tinta/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando…" : "Enviar reporte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}