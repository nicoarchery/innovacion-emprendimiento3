export interface Project {
  id: string;
  name: string;
  municipality: string;
  description: string;
  secopPct: number;
  fieldPct: number;
}

export const MUNICIPALITIES = [
  "Cali",
  "Puerto Gaitán",
  "Montelíbano",
  "Yumbo",
  "Cartagena",
] as const;

export type Municipality = (typeof MUNICIPALITIES)[number];

export const MAP_POSITIONS: Record<Municipality, { x: number; y: number }> = {
  Cali: { x: 155, y: 210 },
  "Puerto Gaitán": { x: 225, y: 130 },
  Montelíbano: { x: 210, y: 80 },
  Yumbo: { x: 140, y: 200 },
  Cartagena: { x: 195, y: 100 },
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Placa Huella Vía Rural",
    municipality: "Puerto Gaitán",
    description:
      "Construcción de 4.2 km de vía de conexión rural que beneficia directamente a 1.200 habitantes de veredas aisladas.",
    secopPct: 72,
    fieldPct: 45,
  },
  {
    id: "p2",
    name: "Centro de Salud Comunitario",
    municipality: "Montelíbano",
    description:
      "Edificación de un centro de salud con atención primaria, odontología y sala de urgencias para comunidades rurales.",
    secopPct: 90,
    fieldPct: 58,
  },
  {
    id: "p3",
    name: "Acueducto Veredal El Aroma",
    municipality: "Cali",
    description:
      "Sistema de acueducto que abastece de agua potable a 340 familias en zona periurbana del norte del Valle del Cauca.",
    secopPct: 65,
    fieldPct: 62,
  },
  {
    id: "p4",
    name: "Sistema de Alumbrado Público",
    municipality: "Yumbo",
    description:
      "Instalación de 180 luminarias LED en vías principales del corregimiento de La Paila, mejorando seguridad vial.",
    secopPct: 100,
    fieldPct: 100,
  },
  {
    id: "p5",
    name: "Parque Metropolitano",
    municipality: "Cartagena",
    description:
      "Intervención paisajística y equipamiento deportivo en 3 hectáreas de zona verde urbana en el corregimiento de Arrozal.",
    secopPct: 80,
    fieldPct: 38,
  },
  {
    id: "p6",
    name: "Centro Comunitario Nueva Vida",
    municipality: "Puerto Gaitán",
    description:
      "Construcción de polideportivo y espacio cultural con capacidad para 400 personas en el barrio Nueva Vida.",
    secopPct: 55,
    fieldPct: 20,
  },
  {
    id: "p7",
    name: "Red de Alcantarillado",
    municipality: "Montelíbano",
    description:
      "Ampliación de la red de alcantarillado con 2.8 km de tubería que cubre 6 barrios históricamente sin saneamiento.",
    secopPct: 40,
    fieldPct: 15,
  },
  {
    id: "p8",
    name: "Sede Administrativa Municipal",
    municipality: "Cali",
    description:
      "Remodelación integral de la sede administrativa del corregimiento de La Cumbre para centralizar servicios públicos.",
    secopPct: 85,
    fieldPct: 70,
  },
];

export const MUNICIPALITY_PROJECTS = MOCK_PROJECTS.reduce<
  Record<string, Project[]>
>((acc, p) => {
  if (!acc[p.municipality]) acc[p.municipality] = [];
  acc[p.municipality].push(p);
  return acc;
}, {});

export const BENCHMARK_DATA = [
  {
    company: "Empresa A",
    sector: "Energía",
    investment: 4200,
    verification: 3100,
    projects: 12,
  },
  {
    company: "Empresa B",
    sector: "Minería",
    investment: 5800,
    verification: 4700,
    projects: 18,
  },
  {
    company: "Empresa C",
    sector: "Concesiones Viales",
    investment: 3100,
    verification: 2600,
    projects: 9,
  },
];

export const ROLE_OPTIONS = [
  "Gerente de Sostenibilidad",
  "Director de Asuntos Corporativos",
  "Jefe de RSE",
  "Consultor ESG",
  "Otro",
] as const;

export const SECTOR_OPTIONS = [
  "Energía",
  "Minería",
  "Hidrocarburos",
  "Concesiones Viales",
  "Construcción",
  "Agroindustria",
  "Otro",
] as const;
