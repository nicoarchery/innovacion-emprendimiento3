"use client";

import {
  Building2,
  Calendar,
  DollarSign,
  Download,
  ExternalLink,
  FileCheck2,
  MapPin,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatCOP, type ContractProject } from "@/lib/secop";

interface ProjectDetailsModalProps {
  project: ContractProject | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenVerify: () => void;
}

export function ProjectDetailsModal({
  project,
  isOpen,
  onClose,
  onOpenVerify,
}: ProjectDetailsModalProps) {
  const { toast } = useToast();

  if (!project) return null;

  const estimatedBeneficiaries = Math.round((project.contractValue / 1000000) * 1.8);
  const estimatedJobs = Math.max(12, Math.round(project.contractValue / 85000000));

  const handleDownloadPdf = () => {
    toast({
      title: "Ficha en preparación",
      description: `Reunimos contrato, avance y reportes del contrato ${project.reference} en un PDF.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200">
              SECOP II · {project.contractType}
            </span>
            {project.bpin && (
              <span className="bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded border border-slate-200">
                BPIN: {project.bpin}
              </span>
            )}
            <span
              className={`ml-auto font-semibold px-2 py-0.5 rounded-full ${
                project.atRisk
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {project.atRisk ? `Difiere ${project.gap}%` : "Al día"}
            </span>
          </div>

          <DialogTitle className="text-xl font-bold text-slate-900 mt-2">
            {project.reference}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            {project.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Ficha del contrato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Building2 className="h-4 w-4 text-indigo-600" />
                <span>Entidad y contratista</span>
              </div>
              <div>
                <p className="text-slate-500">Entidad:</p>
                <p className="font-semibold text-slate-900">{project.entityName}</p>
                <p className="text-[11px] text-slate-500">NIT: {project.entityNit}</p>
              </div>
              <div className="pt-1 border-t border-slate-200">
                <p className="text-slate-500">Contratista:</p>
                <p className="font-semibold text-slate-900">{project.contractorName}</p>
                <p className="text-[11px] text-slate-500">Doc: {project.contractorDoc}</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span>Valor y plazos</span>
              </div>
              <div>
                <p className="text-slate-500">Valor adjudicado:</p>
                <p className="text-base font-extrabold text-emerald-700">
                  {formatCOP(project.contractValue)}
                </p>
              </div>
              <div className="pt-1 border-t border-slate-200 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-slate-500">Firma:</p>
                  <p className="font-medium text-slate-800 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {project.signDate}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Entrega prevista:</p>
                  <p className="font-medium text-slate-800 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {project.endDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparativa SECOP II frente a terreno */}
          <div className="rounded-lg border border-slate-200 p-4 bg-white shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <FileCheck2 className="h-4 w-4 text-indigo-600" />
              SECOP II frente a terreno
            </h4>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
                <span className="text-xs text-indigo-800 font-medium block">
                  Registro SECOP II
                </span>
                <span className="text-2xl font-black text-indigo-700 mt-1 block">
                  {project.secopPct}%
                </span>
                <span className="text-[11px] text-indigo-600">Avance contractual</span>
              </div>

              <div
                className={`p-3 rounded-lg border ${
                  project.atRisk
                    ? "bg-amber-50/70 border-amber-200"
                    : "bg-emerald-50/60 border-emerald-100"
                }`}
              >
                <span
                  className={`text-xs font-medium block ${
                    project.atRisk ? "text-amber-800" : "text-emerald-800"
                  }`}
                >
                  Avance en terreno
                </span>
                <span
                  className={`text-2xl font-black mt-1 block ${
                    project.atRisk ? "text-amber-700" : "text-emerald-700"
                  }`}
                >
                  {project.fieldPct}%
                </span>
                <span
                  className={`text-[11px] ${
                    project.atRisk ? "text-amber-600" : "text-emerald-600"
                  }`}
                >
                  {project.verifiedCount} reportes ciudadanos
                </span>
              </div>
            </div>

            {project.lastReportObservation && (
              <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="font-semibold text-slate-800 block">
                  Último reporte ciudadano ({project.lastReportDate || "reciente"}):
                </span>
                <p className="text-slate-600 italic mt-0.5">
                  &ldquo;{project.lastReportObservation}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Alcance estimado */}
          <div className="rounded-lg border border-slate-200 p-3.5 bg-slate-50">
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-emerald-600" />
              Alcance estimado de la obra
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Cobertura aprox.</span>
                <span className="font-bold text-slate-800">
                  +{estimatedBeneficiaries.toLocaleString("es-CO")} hab.
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Empleo aprox.</span>
                <span className="font-bold text-slate-800">~{estimatedJobs} puestos</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Ubicación</span>
                <span className="font-bold text-slate-800 truncate block">
                  {project.municipality}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 gap-2 flex-col sm:flex-row justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            className="gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Descargar ficha (PDF)
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  `https://www.datos.gov.co/resource/6qex-kahp.json?$limit=5&departamento=${encodeURIComponent(
                    project.department
                  )}`,
                  "_blank"
                )
              }
              className="text-xs gap-1"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver en datos.gov.co
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onClose();
                onOpenVerify();
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
            >
              Reportar avance
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
