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
        title: "Reporte publicado",
        description: `Registramos ${newFieldPct}% de avance en terreno. La diferencia con SECOP II quedó en ${newGap}%.`,
      });
    }, 400);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-sello">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Reporte ciudadano
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-tinta leading-tight">
            Cuéntanos cómo va la obra
          </DialogTitle>
          <DialogDescription className="text-sm text-tinta/65 line-clamp-2">
            {project.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Metadata contextual */}
          <div className="rounded-[4px] bg-papel p-3 border border-tinta/20 text-xs text-tinta/75 grid grid-cols-2 gap-2">
            <div>
              <span className="text-tinta/55 block">Ubicación:</span>
              <span className="font-semibold flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-green-700" />
                {project.municipality}, {project.department}
              </span>
            </div>
            <div>
              <span className="text-tinta/55 block">SECOP II registra:</span>
              <span className="font-semibold text-sello">
                {project.secopPct}% de avance
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="reporterName" className="text-xs font-medium text-tinta/75">
                Tu nombre o veeduría
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
              <Label htmlFor="reporterContact" className="text-xs font-medium text-tinta/75">
                Correo o teléfono
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
              <Label htmlFor="pctRange" className="text-xs font-medium text-tinta/75">
                Avance que ves en terreno
              </Label>
              <span className="text-sm font-bold text-sello bg-green-50 px-2 py-0.5 rounded border border-green-700/30">
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
              className="w-full accent-sello cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-tinta/40 mt-0.5">
              <span>0% (sin iniciar o detenida)</span>
              <span>50% (a mitad de camino)</span>
              <span>100% (entregada)</span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-tinta/75">
              Estado que ves en terreno
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
                      ? "bg-sello text-white border-sello"
                      : "bg-white text-tinta/75 border-tinta/20 hover:bg-papel"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="observation" className="text-xs font-medium text-tinta/75">
              Lo que viste (hechos concretos)
            </Label>
            <Textarea
              id="observation"
              placeholder="Describe lo que viste (ej. sin maquinaria hace una semana, falta señalización, material abandonado)..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={2}
              className="mt-1 text-xs"
            />
          </div>

          {/* Fotografía y coordenadas */}
          <div className="rounded-[4px] border border-dashed border-tinta/25 p-3 bg-papel flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-[3px] bg-green-100 flex items-center justify-center text-sello shrink-0">
                <Camera className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-tinta/85">
                  Foto con ubicación y fecha
                </p>
                <p className="text-[11px] text-tinta/55">
                  Tomamos el GPS ({project.municipality}) y la fecha de la foto.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setHasPhoto(!hasPhoto)}
              className={`text-xs gap-1.5 ${hasPhoto ? "border-sello text-sello bg-green-50" : ""}`}
            >
              {hasPhoto ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-700" />
                  Foto lista
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Subir foto
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
              className="bg-primary text-primary-foreground hover:bg-tinta/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar reporte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
