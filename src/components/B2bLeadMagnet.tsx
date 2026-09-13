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
import { BENCHMARK_DATA, ROLE_OPTIONS, SECTOR_OPTIONS } from "@/lib/data";
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

function BenchmarkChart() {
  const maxInvestment = Math.max(
    ...BENCHMARK_DATA.map((d) => d.investment)
  );

  return (
    <div className="space-y-5">
      {BENCHMARK_DATA.map((d) => (
        <div key={d.company} className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">{d.company}</span>
            <span className="text-xs text-muted-foreground">
              {d.sector} · {d.projects} obras
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-28 shrink-0 text-muted-foreground">
                Inversión social
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{ width: `${(d.investment / maxInvestment) * 100}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right font-semibold text-slate-700">
                ${d.investment}M
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-28 shrink-0 text-muted-foreground">
                Verificada en campo
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-600"
                  style={{
                    width: `${(d.verification / maxInvestment) * 100}%`,
                  }}
                />
              </div>
              <span className="w-16 shrink-0 text-right font-semibold text-emerald-700">
                ${d.verification}M
              </span>
            </div>
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        Benchmarking anónimo ilustrativo de inversión social en el sector
        energético colombiano (cifras en millones de COP).
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
    if (!form.name.trim()) next.name = "Ingresa tu nombre completo.";
    if (!form.company.trim()) next.company = "Ingresa el nombre de la empresa.";
    if (!form.role) next.role = "Selecciona tu cargo.";
    if (!form.sector) next.sector = "Selecciona el sector industrial.";

    const email = form.email.trim();
    if (!email) {
      next.email = "Ingresa tu correo corporativo.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "El formato del correo no es válido.";
    } else if (!isCorporateEmail(email)) {
      next.email = "Usa tu correo corporativo (ej. nombre@empresa.com).";
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

    const message = `Hola 👋 Solicito el "Informe de Transparencia e Impacto Territorial 2026".\n\n• Nombre: ${form.name.trim()}\n• Correo corporativo: ${form.email.trim()}\n• Empresa: ${form.company.trim()}\n• Cargo: ${form.role}\n• Sector: ${form.sector}\n\nAgradezco me envíen el PDF por este canal.`;

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
        "Estamos abriendo WhatsApp para enviarte el Informe de Transparencia e Impacto Territorial 2026.",
    });

    setForm({ name: "", email: "", company: "", role: "", sector: "" });
  }

  return (
    <section id="lead-b2b" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700">
            <Building2 className="h-4 w-4" />
            Para equipos de sostenibilidad y asuntos corporativos
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Descarga el Informe de Transparencia e Impacto Territorial 2026
          </h2>
          <p className="mt-4 text-muted-foreground">
            Descubre cómo se comparan las inversiones sociales de tu sector en
            Colombia con datos verificados de SECOP II y evidencia en campo.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BadgeCheck className="h-5 w-5 text-emerald-600" />
                Benchmarking Sectorial (extracto)
              </CardTitle>
              <CardDescription>
                Inversión social declarada vs. porcentaje físicamente verificado
                por empresa del sector energético.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BenchmarkChart />
            </CardContent>
          </Card>

          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg">
                Solicita tu copia gratuita
              </CardTitle>
              <CardDescription>
                Déjanos tus datos corporativos y recibe el informe por WhatsApp.
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
                  <Label htmlFor="b2b-email">Correo corporativo</Label>
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
                  <Label htmlFor="b2b-company">Nombre de la empresa</Label>
                  <Input
                    id="b2b-company"
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    placeholder="Grupo Empresarial XYZ"
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
                    : "Descargar Informe 2026 (PDF)"}
                </Button>

                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  Solo usamos tu correo corporativo para validar el acceso.
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
            Conoce cómo verificamos las evidencias
          </a>
        </div>
      </div>
    </section>
  );
}