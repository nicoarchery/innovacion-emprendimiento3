"use client";

import { useState } from "react";
import { Bell, MapPinned, MessageCircle } from "lucide-react";

import { ColombiaMap } from "@/components/ColombiaMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { track } from "@/lib/analytics";
import {
  MUNICIPALITIES,
  MUNICIPALITY_PROJECTS,
  MOCK_PROJECTS,
  type Municipality,
  type Project,
} from "@/lib/data";
import { openWhatsApp } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const GAP_THRESHOLD = 15;

function getGap(project: Project) {
  return project.secopPct - project.fieldPct;
}

function ProjectGapBars({ project }: { project: Project }) {
  const gap = getGap(project);
  const atRisk = gap > GAP_THRESHOLD;

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">
            Ejecución SECOP II
          </span>
          <span className="font-semibold text-slate-700">
            {project.secopPct}%
          </span>
        </div>
        <Progress
          value={project.secopPct}
          indicatorClassName="bg-indigo-600"
        />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">
            Evidencia Física en Campo
          </span>
          <span className="font-semibold text-slate-700">
            {project.fieldPct}%
          </span>
        </div>
        <Progress
          value={project.fieldPct}
          indicatorClassName={atRisk ? "bg-amber-500" : "bg-emerald-600"}
        />
      </div>
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
          atRisk
            ? "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200"
            : "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200"
        )}
      >
        {atRisk ? (
          <>
            <Bell className="h-3.5 w-3.5" />
            Brecha del {gap}% · Alerta de Riesgo Territorial
          </>
        ) : (
          <>Brecha del {gap}% · Ejecución en línea</>
        )}
      </div>
    </div>
  );
}

export function MapPreviewSection() {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Municipality | "Todos">(
    "Puerto Gaitán"
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedForDialog, setSelectedForDialog] =
    useState<Municipality>("Puerto Gaitán");
  const [contact, setContact] = useState("");

  const counts = Object.values(MUNICIPALITIES).reduce<
    Record<string, number>
  >((acc, m) => {
    acc[m] = MUNICIPALITY_PROJECTS[m]?.length ?? 0;
    return acc;
  }, {});

  const visibleProjects =
    selected === "Todos" ? MOCK_PROJECTS : MUNICIPALITY_PROJECTS[selected];

  const dialogProjects = MUNICIPALITY_PROJECTS[selectedForDialog] ?? [];

  function openDialog(municipality: Municipality) {
    setSelectedForDialog(municipality);
    setDialogOpen(true);
  }

  function handleSelectFromMap(municipality: Municipality) {
    setSelected(municipality);
    openDialog(municipality);
  }

  function handleAlert(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!contact.trim()) return;

    const message = `Hola 👋 Vivo cerca de ${selectedForDialog} y quiero recibir alertas sobre estas obras de impacto:\n${dialogProjects
      .map((p) => `• ${p.name}`)
      .join("\n")}\n\nMi contacto: ${contact.trim()}`;

    track("CompleteRegistration", {
      content_name: "Alerts_Citizen",
      content_category: "Citizen_Alert",
      municipality: selectedForDialog,
    });

    fetch("/api/lead-citizen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact: contact.trim(), municipality: selectedForDialog }),
    }).catch(() => undefined);

    openWhatsApp(message);

    toast({
      title: "¡Listo! Estamos abriendo WhatsApp",
      variant: "success",
      description:
        "Te envía una solicitud de alerta para las obras de " + selectedForDialog + ".",
    });
    setContact("");
  }

  return (
    <section id="mapa-ciudadano" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Mapa ciudadano
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            ¿Sabes en qué se están invirtiendo los fondos en tu municipio?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Consulta el mapa abierto de proyectos verificados y compara la
            ejecución registrada en SECOP II con la evidencia física en campo.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Button
            key="all"
            variant={selected === "Todos" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelected("Todos")}
          >
            Todos
          </Button>
          {MUNICIPALITIES.map((municipality) => (
            <Button
              key={municipality}
              variant={selected === municipality ? "default" : "outline"}
              size="sm"
              onClick={() => setSelected(municipality)}
            >
              {municipality}
            </Button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
          <Card className="p-4 sm:p-6">
            <ColombiaMap
              selected={selected}
              counts={counts}
              onSelectMunicipality={handleSelectFromMap}
            />
            <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              Haz clic en un pin para ver el estado de ejecución vs. la
              evidencia en campo de cada obra.
            </p>
          </Card>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <MapPinned className="h-5 w-5 text-emerald-700" />
              Obras en {selected}
            </h3>
            {visibleProjects.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Selecciona un municipio para ver sus proyectos.
              </p>
            )}
            {visibleProjects.map((project) => {
              const gap = getGap(project);
              const atRisk = gap > GAP_THRESHOLD;
              return (
                <Card key={project.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base">
                        {project.name}
                      </CardTitle>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                          atRisk
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        )}
                      >
                        {atRisk ? "Riesgo" : "En línea"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ProjectGapBars project={project} />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() =>
                        openDialog(project.municipality as Municipality)
                      }
                    >
                      Ver detalle y recibir alertas
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Obras de impacto en {selectedForDialog}</DialogTitle>
            <DialogDescription>
              Compará la ejecución oficial con la evidencia física reportada en
              campo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {dialogProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-lg border bg-slate-50 p-4"
              >
                <p className="font-semibold text-foreground">{project.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {project.description}
                </p>
                <div className="mt-3">
                  <ProjectGapBars project={project} />
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleAlert}
            className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4"
          >
            <div className="flex items-center gap-2 font-semibold text-emerald-900">
              <Bell className="h-4 w-4" />
              ¿Vives cerca? Recibe alertas sobre estas obras
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact">Correo o WhatsApp</Label>
              <Input
                id="contact"
                type="text"
                placeholder="ej. 3001234567 o tu@correo.com"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="whatsapp" className="w-full">
              <MessageCircle className="h-4 w-4" />
              Suscribirme por WhatsApp
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}