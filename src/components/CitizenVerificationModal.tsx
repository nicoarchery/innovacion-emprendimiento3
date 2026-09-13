"use client";

import { useState } from "react";
import { Camera, CheckCircle2, MapPin, ShieldAlert, Upload } from "lucide-react";
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
import type { ContractProject } from "@/lib/secop";

interface CitizenVerificationModalProps {
  project: ContractProject | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: ContractProject) => void;
}

export function CitizenVerificationModal({
  project,
  isOpen,
  onClose,
  onSuccess,
}: CitizenVerificationModalProps) {
  const { toast } = useToast();
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [observedPct, setObservedPct] = useState<number>(
    project?.fieldPct ?? 50
  );
  const [statusObservation, setStatusObservation] = useState("retraso");
  const [observation, setObservation] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newFieldPct = Math.min(100, Math.max(0, observedPct));
      const newGap = Math.abs(project.secopPct - newFieldPct);
      const newAtRisk = newGap > 15;

      const updatedProject: ContractProject = {
        ...project,
        fieldPct: newFieldPct,
        gap: newGap,
        atRisk: newAtRisk,
        verifiedCount: project.verifiedCount + 1,
        lastReportDate: new Date().toISOString().split("T")[0],
        lastReportObservation:
          observation.trim() ||
          `Reporte comunitario de ${reporterName || "Veeduría"}: avance observado en ${newFieldPct}%.`,
      };

      onSuccess(updatedProject);
      setIsSubmitting(false);
      onClose();

      toast({
        title: "Evidencia Territorial Registrada",
        description: `Se actualizó el avance en campo al ${newFieldPct}%. La brecha contractual ahora es del ${newGap}%.`,
      });
    }, 400);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-700">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Auditoría Comunitaria & Veeduría
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 leading-tight">
            Reportar Evidencia en Terreno
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 line-clamp-2">
            {project.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Metadata contextual */}
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-xs text-slate-700 grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500 block">Ubicación:</span>
              <span className="font-semibold flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                {project.municipality}, {project.department}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Ejecución SECOP II:</span>
              <span className="font-semibold text-indigo-700">
                {project.secopPct}% contractual
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="reporterName" className="text-xs font-medium text-slate-700">
                Nombre o Veeduría / JAC
              </Label>
              <Input
                id="reporterName"
                placeholder="Ej. Veeduría Río Guatapurí"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="reporterContact" className="text-xs font-medium text-slate-700">
                WhatsApp o Correo
              </Label>
              <Input
                id="reporterContact"
                placeholder="Ej. 310 123 4567"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor="pctRange" className="text-xs font-medium text-slate-700">
                % Avance Físico Real Observado en Terreno
              </Label>
              <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {observedPct}%
              </span>
            </div>
            <input
              id="pctRange"
              type="range"
              min="0"
              max="100"
              step="5"
              value={observedPct}
              onChange={(e) => setObservedPct(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
              <span>0% (Sin iniciar / paralizada)</span>
              <span>50% (Media marcha)</span>
              <span>100% (Obra entregada)</span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-slate-700">
              Estado de la Obra en Terreno
            </Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                { id: "normal", label: "En ejecución" },
                { id: "retraso", label: "Con retraso" },
                { id: "paralizada", label: "Paralizada" },
              ].map((st) => (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => setStatusObservation(st.id)}
                  className={`py-1.5 text-xs rounded-md font-medium border text-center transition-colors ${
                    statusObservation === st.id
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="observation" className="text-xs font-medium text-slate-700">
              Observación de la Comunidad (Hechos y Testimonio)
            </Label>
            <Textarea
              id="observation"
              placeholder="Describe lo observado en campo (ej. ausencia de maquinaria, falta de señalización, material abandonado)..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={2}
              className="mt-1 text-xs"
            />
          </div>

          {/* Fotografía y coordenadas EXIF simuladas */}
          <div className="rounded-lg border border-dashed border-slate-300 p-3 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <Camera className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Foto de Evidencia con Metadatos EXIF
                </p>
                <p className="text-[11px] text-slate-500">
                  Extrae GPS ({project.municipality}) y fecha automática.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setHasPhoto(!hasPhoto)}
              className={`text-xs gap-1.5 ${hasPhoto ? "border-emerald-600 text-emerald-700 bg-emerald-50" : ""}`}
            >
              {hasPhoto ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Foto adjunta (GPS OK)
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Cargar Evidencia
                </>
              )}
            </Button>
          </div>

          <DialogFooter className="pt-2 gap-2">
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
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Validando..." : "Registrar y Recalcular Brecha"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
