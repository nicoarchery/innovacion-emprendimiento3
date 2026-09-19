"use client";

import { useState } from "react";
import {
  ArrowDown,
  BadgeCheck,
  Building2,
  FileText,
  Loader2,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { track } from "@/lib/analytics";
import { ROLE_OPTIONS, SECTOR_OPTIONS } from "@/lib/data";
import { openWhatsApp } from "@/lib/whatsapp";

const BLOCKED_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "aol.com",
  "live.com",
  "msn.com",
];

function isCorporateEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();
  return Boolean(domain && !BLOCKED_DOMAINS.includes(domain));
}

function RecognitionSteps() {
  const steps = [
    {
      title: "Publicas tu ficha",
      text: "Contrato SECOP II, valor, contratista, fechas y estado. Todo con fuente citada.",
    },
    {
      title: "La comunidad confirma",
      text: "Reportes con foto, fecha y ubicación validan el avance en terreno.",
    },
    {
      title: "Recibes el sello",
      text: "Las obras al día muestran reconocimiento público en el mapa y en tu ficha.",
    },
  ];

  return (
    <div className="space-y-5">
      {steps.map((s, i) => (
        <div key={s.title} className="flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
            {i + 1}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">{s.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{s.text}</p>
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        El sello se mantiene mientras la diferencia entre SECOP II y terreno
        no supere 15%.
      </p>
    </div>
  );
}

export function B2bLeadMagnet() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    sector: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Escribe tu nombre completo.";
    if (!form.company.trim()) next.company = "Escribe el nombre de la entidad.";
    if (!form.role) next.role = "Elige tu cargo.";
    if (!form.sector) next.sector = "Elige el sector.";

    const email = form.email.trim();
    if (!email) {
      next.email = "Escribe tu correo de trabajo.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Revisa el formato del correo.";
    } else if (!isCorporateEmail(email)) {
      next.email = "Usa tu correo de trabajo (ej. nombre@entidad.com).";
    }
    return next;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setSubmitting(true);

    const message = `Solicito la ficha de reconocimiento para nuestra organización.\n\n• Nombre: ${form.name.trim()}\n• Correo: ${form.email.trim()}\n• Empresa: ${form.company.trim()}\n• Cargo: ${form.role}\n• Sector: ${form.sector}`;

    track("Lead", {
      content_category: "B2B_Report_Download",
    });

    fetch("/api/lead-b2b", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        role: form.role,
        sector: form.sector,
      }),
    })
      .catch(() => undefined)
      .finally(() => setSubmitting(false));

    openWhatsApp(message);

    toast({
      title: "Solicitud recibida",
      variant: "success",
      description:
        "Abrimos WhatsApp con tu solicitud de ficha de reconocimiento.",
    });

    setForm({ name: "", email: "", company: "", role: "", sector: "" });
  }

  return (
    <section id="para-organizaciones" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700">
            <Building2 className="h-4 w-4" />
            Para entidades y contratistas
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            El cumplimiento visible genera reconocimiento público
          </h2>
          <p className="mt-4 text-muted-foreground">
            Publicamos tu ficha con contrato, avance y reportes ciudadanos.
            Las obras al día reciben sello visible en el mapa.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BadgeCheck className="h-5 w-5 text-emerald-600" />
                Cómo obtienes el reconocimiento
              </CardTitle>
              <CardDescription>
                Tres pasos entre tu ficha publicada y el sello visible en el
                mapa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecognitionSteps />
            </CardContent>
          </Card>

          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg">
                Solicita tu ficha de reconocimiento
              </CardTitle>
              <CardDescription>
                Déjanos tus datos y recibe los requisitos por WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="b2b-name">Nombre completo</Label>
                  <Input
                    id="b2b-name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Ana María López"
                  />
                  {errors.name && (
                    <p className="text-xs font-medium text-red-600">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="b2b-email">Correo de trabajo</Label>
                  <Input
                    id="b2b-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="ana.lopez@empresa.com"
                  />
                  {errors.email && (
                    <p className="text-xs font-medium text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="b2b-company">Entidad u organización</Label>
                  <Input
                    id="b2b-company"
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    placeholder="Alcaldía, empresa o contratista"
                  />
                  {errors.company && (
                    <p className="text-xs font-medium text-red-600">
                      {errors.company}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="b2b-role">Cargo</Label>
                    <Select
                      id="b2b-role"
                      value={form.role}
                      onChange={(e) => update("role", e.target.value)}
                      className={form.role ? "" : "text-muted-foreground"}
                    >
                      <option value="" disabled>
                        Selecciona...
                      </option>
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </Select>
                    {errors.role && (
                      <p className="text-xs font-medium text-red-600">
                        {errors.role}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="b2b-sector">Sector industrial</Label>
                    <Select
                      id="b2b-sector"
                      value={form.sector}
                      onChange={(e) => update("sector", e.target.value)}
                      className={form.sector ? "" : "text-muted-foreground"}
                    >
                      <option value="" disabled>
                        Selecciona...
                      </option>
                      {SECTOR_OPTIONS.map((sector) => (
                        <option key={sector} value={sector}>
                          {sector}
                        </option>
                      ))}
                    </Select>
                    {errors.sector && (
                      <p className="text-xs font-medium text-red-600">
                        {errors.sector}
                      </p>
                    )}
                  </div>
                </div>

                <Button type="submit" variant="whatsapp" className="w-full">
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  {submitting
                    ? "Enviando solicitud..."
                    : "Solicitar ficha por WhatsApp"}
                </Button>

                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  Pedimos tu correo de trabajo para confirmar que representas a la entidad.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href="#como-funciona"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-700"
          >
            <ArrowDown className="h-4 w-4 animate-bounce" />
            Conoce cómo confirmamos el avance
          </a>
        </div>
      </div>
    </section>
  );
}