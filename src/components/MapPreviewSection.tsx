"use client";

import { useState } from "react";
import { Bell, MapPinned, MessageCircle } from "lucide-react";

import { ColombiaMap } from "@/components/ColombiaMap";
import { Button } from "@/components/ui/button";
import { Stamp } from "@/components/Stamp";
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

const GAP_THRESHOLD = 15;

function getGap(project: Project) {
  return project.secopPct - project.fieldPct;
}

function ProjectGapBars({ project }: { project: Project }) {
  const gap = getGap(project);
  const needsReview = gap > GAP_THRESHOLD;

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-tinta/60">Avance según SECOP II</span>
          <span className="font-mono font-bold tabular-nums text-tinta">
            {project.secopPct}%
          </span>
        </div>
        <Progress value={project.secopPct} indicatorClassName="bg-sello" />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-tinta/60">Avance confirmado en terreno</span>
          <span className="font-mono font-bold tabular-nums text-tinta">
            {project.fieldPct}%
          </span>
        </div>
        <Progress
          value={project.fieldPct}
          indicatorClassName={needsReview ? "bg-amber-600" : "bg-green-700"}
        />
      </div>
      <Stamp tone={needsReview ? "revision" : "verificado"}>
        {needsReview && <Bell className="h-3 w-3" />}
        Difiere {gap}% · {needsReview ? "Requiere revisión" : "Al día"}
      </Stamp>
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

    const message = `Vivo cerca de ${selectedForDialog} y quiero recibir alertas de estas obras:\n${dialogProjects
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
      title: "Abriendo WhatsApp",
      variant: "success",
      description:
        "Te preparamos un mensaje para seguir las obras de " + selectedForDialog + ".",
    });
    setContact("");
  }

  return (
    <section id="mapa-ciudadano" className="bg-papel">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold text-tinta sm:text-4xl">
            Las obras de tu municipio, con el avance a la vista
          </h2>
          <p className="mt-3 text-lg text-tinta/70">
            Elige un municipio y compara lo que registra SECOP II con lo
            que la gente ve en terreno.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
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

        <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
          <div className="border border-tinta/20 bg-ficha p-4 sm:p-6">
            <ColombiaMap
              selected={selected}
              counts={counts}
              onSelectMunicipality={handleSelectFromMap}
            />
            <p className="mt-4 flex items-start gap-2 text-xs text-tinta/60">
              <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-sello" />
              Elige un punto para comparar el registro SECOP II con el avance
              en terreno de cada obra.
            </p>
          </div>

          <div>
            <h3 className="flex items-baseline gap-3 font-display text-xl font-semibold text-tinta">
              Obras en {selected}
              <span className="font-mono text-xs font-bold tabular-nums text-tinta/50">
                {visibleProjects.length} en ficha
              </span>
            </h3>
            {visibleProjects.length === 0 && (
              <p className="mt-4 text-sm text-tinta/60">
                Selecciona un municipio para ver sus proyectos.
              </p>
            )}
            <div className="mt-2 border-t-2 border-tinta/70">
              {visibleProjects.map((project) => {
                const gap = getGap(project);
                const needsReview = gap > GAP_THRESHOLD;
                return (
                  <article
                    key={project.id}
                    className="border-b border-tinta/15 py-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-semibold leading-snug text-tinta">
                        {project.name}
                      </h4>
                      <Stamp
                        tone={needsReview ? "revision" : "verificado"}
                      >
                        {needsReview ? "Requiere revisión" : "Al día"}
                      </Stamp>
                    </div>
                    <div className="mt-3 max-w-md">
                      <ProjectGapBars project={project} />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openDialog(project.municipality as Municipality)
                      }
                      className="mt-3 text-sm font-semibold text-sello underline-offset-4 hover:underline"
                    >
                      Ver ficha y seguir obra
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Obras en {selectedForDialog}
            </DialogTitle>
            <DialogDescription>
              Compara el registro oficial con el reporte en terreno. Si una
              obra va al día, tu confirmación respalda su reconocimiento.
            </DialogDescription>
          </DialogHeader>

          <div className="border-t-2 border-tinta/70">
            {dialogProjects.map((project) => (
              <div
                key={project.id}
                className="border-b border-tinta/15 bg-papel py-4"
              >
                <p className="font-semibold text-tinta">{project.name}</p>
                <p className="mt-1 text-sm text-tinta/65">
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
            className="space-y-3 border border-sello/30 bg-accent/40 p-4"
          >
            <div className="flex items-center gap-2 font-semibold text-tinta">
              <Bell className="h-4 w-4 text-sello" />
              ¿Vives cerca? Confirma el avance y sigue estas obras
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact">Correo o WhatsApp</Label>
              <Input
                id="contact"
                type="text"
                placeholder="300 123 4567 o tu@correo.com"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="whatsapp" className="w-full">
              <MessageCircle className="h-4 w-4" />
              Seguir obras por WhatsApp
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
