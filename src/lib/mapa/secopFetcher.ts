import { classifyObra } from "@/lib/mapa/clasificador";
import type {
  ClasificacionObra,
  ObraNormalizada,
  RawContratoSecop,
} from "@/lib/mapa/types";

const CONTRATOS_SECOP_II_CHILD = "https://www.datos.gov.co/resource/jbjy-vk9h.json";

const CALI_CRITERIA =
  'upper(ciudad)="CALI" and tipo_de_contrato in ("Obra","Concesión","Asociación Público Privada")';

function limpiarValor(valor: string | number | undefined): number {
  if (valor === undefined || valor === null) return 0;
  if (typeof valor === "number") return Math.round(valor);
  const parsed = parseFloat(String(valor).replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

// Distingue "0" (dato presente: totalmente ejecutado/pagado) de "sin dato".
function limpiarValorOpcional(valor: string | number | undefined): number | null {
  if (valor === undefined || valor === null) return null;
  return limpiarValor(valor);
}

function limpiarFecha(fecha?: string): string {
  return (fecha ?? "").split("T")[0] || "";
}

export function normalizarDireccion(direccion?: string): string {
  if (!direccion) return "";
  const compacta = direccion.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
  // Remover la cola administrativa (ciudad/departamento/país) cuando aparece al final
  return compacta
    .replace(
      /(?:,\s*)?(?:(?:Santiago de Cali|Cali|Valle del Cauca|COLOMBIA|Colombia)\s*,?\s*)+\s*$/i,
      ""
    )
    .trim()
    .replace(/[,\s]+$/g, "");
}

function stringifyUrl(url: RawContratoSecop["urlproceso"]): string {
  if (typeof url === "string") return url;
  return url?.url ?? "";
}

export function normalizarContrato(raw: RawContratoSecop): ObraNormalizada {
  return {
    id_contrato: raw.id_contrato?.trim() ?? "",
    proceso_de_compra: raw.proceso_de_compra?.trim() ?? "",
    referencia: raw.referencia_del_contrato?.trim() ?? "",
    entidad_nombre: raw.nombre_entidad?.trim() ?? "",
    entidad_nit: raw.nit_entidad?.trim() ?? "",
    contratista: raw.proveedor_adjudicado?.trim() ?? "",
    contratista_doc: raw.documento_proveedor?.trim() ?? "",
    departamento: raw.departamento?.trim() ?? "",
    municipio: raw.ciudad?.trim() ?? "",
    descripcion: (raw.descripcion_del_proceso ?? raw.objeto_del_contrato ?? "").trim(),
    tipo_contrato: raw.tipo_de_contrato?.trim() ?? "",
    unspsc: raw.codigo_de_categoria_principal?.trim() ?? "",
    estado: raw.estado_contrato?.trim() ?? "",
    fecha_firma: limpiarFecha(raw.fecha_de_firma),
    fecha_inicio: limpiarFecha(raw.fecha_de_inicio_del_contrato),
    fecha_fin: limpiarFecha(raw.fecha_de_fin_del_contrato),
    valor: limpiarValor(raw.valor_del_contrato),
    valor_pagado: limpiarValorOpcional(raw.valor_pagado),
    valor_facturado: limpiarValorOpcional(raw.valor_facturado),
    valor_pendiente_ejecucion: limpiarValorOpcional(raw.valor_pendiente_de_ejecucion),
    valor_pendiente_pago: limpiarValorOpcional(raw.valor_pendiente_de_pago),
    url_secop: stringifyUrl(raw.urlproceso),
    direccion_ejecucion: normalizarDireccion(raw.direcci_n_de_ejecuci_n_del_contrato),
    localizacion: raw.localizaci_n?.trim() ?? "",
    secop_updated_at: limpiarFecha(raw.ultima_actualizacion),
  };
}

export function clasificarYFiltrar(contrato: ObraNormalizada): ClasificacionObra {
  return classifyObra(contrato.descripcion, contrato.tipo_contrato, contrato.unspsc);
}

export async function extraerContratosCali(opts?: {
  timeoutMs?: number;
  maxPaginas?: number;
}): Promise<ObraNormalizada[]> {
  const timeoutMs = opts?.timeoutMs ?? 30000;
  const maxPaginas = opts?.maxPaginas ?? 10;
  const resultados: ObraNormalizada[] = [];

  const headers: Record<string, string> = { Accept: "application/json" };
  if (process.env.SOCRATA_APP_TOKEN) {
    headers["X-App-Token"] = process.env.SOCRATA_APP_TOKEN;
  }

  for (let pagina = 0; pagina < maxPaginas; pagina++) {
    const params = new URLSearchParams();
    params.set("$limit", "1000");
    params.set("$offset", String(pagina * 1000));
    params.set("$where", CALI_CRITERIA);
    params.set("$order", "id_contrato");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${CONTRATOS_SECOP_II_CHILD}?${params.toString()}`, {
        headers,
        signal: controller.signal,
        next: { revalidate: 300 },
      });
      clearTimeout(timer);

      if (!res.ok) {
        if (res.status === 429) throw new Error("SECOP rate-limit (429)");
        throw new Error(`SECOP respondió ${res.status}`);
      }

      const data: RawContratoSecop[] = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;

      resultados.push(...data.map(normalizarContrato));

      if (data.length < 1000) break;
      await new Promise((r) => setTimeout(r, 200));
    } catch (error) {
      clearTimeout(timer);
      console.error("[EXTRACCION_SECOP_ERROR]", (error as Error).message);
      break;
    }
  }

  if (resultados.length === 0) {
    console.error(
      "[EXTRACCION_SECOP_AVISO] El dataset " +
        CONTRATOS_SECOP_II_CHILD +
        " no devolvió filas para Cali (¿rotado/truncado?). Se conserva la base local; sin avance financiero para estas obras."
    );
  }

  return resultados;
}