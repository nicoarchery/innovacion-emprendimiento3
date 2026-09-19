import type { ClasificacionObra } from "@/lib/mapa/types";

export const TERMINOS_OBRA = [
  "construct",
  "construcci",
  "adecuaci",
  "rehabilit",
  "mejoramiento",
  "mantenimiento",
  "infraestructura",
  "paviment",
  "placa huella",
  "placas huella",
  "malla vial",
  "andén",
  "anden",
  "cicloruta",
  "puente",
  "colegio",
  "hospital",
  "parque",
  "escenario deportivo",
  "coliseo",
  "cancha",
  "espacio público",
  "espacio publico",
  "urbaniz",
  "alcantarillado",
  "acueducto",
  "colector",
  "planta de tratamiento",
  "cerramiento",
  "iluminaci",
  "malecon",
  "malecón",
] as const;

export const PREFIJOS_UNSPSC_OBRA = ["72", "30", "39"] as const;

const TIPOS_OBRA_DIRECTA = new Set(["Obra", "Obra Pública"]);

export function classifyObra(
  descripcion: string,
  tipoDeContrato: string,
  unspsc: string
): ClasificacionObra {
  const tipo = (tipoDeContrato ?? "").trim();
  const desc = (descripcion ?? "").toLowerCase();
  const razones: string[] = [];

  let score = 0;

  if (TIPOS_OBRA_DIRECTA.has(tipo)) {
    score += 60;
    razones.push("tipo_de_contrato=Obra");
  } else if (tipo === "Asociación Público Privada" || tipo === "Concesión") {
    score += 35;
    razones.push(`tipo_de_contrato=${tipo}`);
  }

  const codigo = (unspsc ?? "").trim();
  if (PREFIJOS_UNSPSC_OBRA.some((p) => codigo.startsWith(p))) {
    score += 20;
    razones.push(`unspsc=${codigo}`);
  }

  const coincidencias = TERMINOS_OBRA.filter((t) => desc.includes(t));
  const extras = Math.min(coincidencias.length * 5, 20);
  score += extras;
  if (coincidencias.length > 0) {
    razones.push(coincidencias.slice(0, 3).join(","));
  }

  const esObra =
    TIPOS_OBRA_DIRECTA.has(tipo) ||
    (score >= 50 && razones.some((r) => r.startsWith("tipo_de_contrato"))) ||
    (score >= 40 && coincidencias.length > 0);

  return {
    isObra: esObra,
    score: Math.min(score, 100),
    reason: razones.join(" · ") || "sin criterio",
  };
}