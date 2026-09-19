export interface RawContratoSecop {
  id_contrato?: string;
  proceso_de_compra?: string;
  referencia_del_contrato?: string;
  nombre_entidad?: string;
  nit_entidad?: string;
  proveedor_adjudicado?: string;
  documento_proveedor?: string;
  departamento?: string;
  ciudad?: string;
  descripcion_del_proceso?: string;
  objeto_del_contrato?: string;
  tipo_de_contrato?: string;
  codigo_de_categoria_principal?: string;
  estado_contrato?: string;
  fecha_de_firma?: string;
  fecha_de_inicio_del_contrato?: string;
  fecha_de_fin_del_contrato?: string;
  valor_del_contrato?: string | number;
  urlproceso?: { url?: string } | string;
  direcci_n_de_ejecuci_n_del_contrato?: string;
  localizaci_n?: string;
  ultima_actualizacion?: string;
}

export type EstadoUbicacion = "pendiente" | "resuelta" | "no_determinada";
export type GeoConfianza = "alta" | "media" | "baja";

export interface ObraRow {
  id_contrato: string;
  proceso_de_compra: string | null;
  referencia: string | null;
  entidad_nombre: string | null;
  entidad_nit: string | null;
  contratista: string | null;
  contratista_doc: string | null;
  departamento: string | null;
  municipio: string | null;
  descripcion: string | null;
  tipo_contrato: string | null;
  unspsc: string | null;
  estado: string | null;
  fecha_firma: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  valor: number | null;
  url_secop: string | null;
  direccion_ejecucion: string | null;
  localizacion: string | null;
  is_obra: number;
  obra_score: number;
  obra_razon: string | null;
  barrio: string | null;
  comuna: string | null;
  lat: number | null;
  lon: number | null;
  geo_fuente: string | null;
  geo_confianza: GeoConfianza | null;
  estado_ubicacion: EstadoUbicacion;
  geo_intentos: number;
  secop_updated_at: string | null;
  synced_at: string | null;
  hash: string;
  created_at: string | null;
}

export interface ObraNormalizada {
  id_contrato: string;
  proceso_de_compra: string;
  referencia: string;
  entidad_nombre: string;
  entidad_nit: string;
  contratista: string;
  contratista_doc: string;
  departamento: string;
  municipio: string;
  descripcion: string;
  tipo_contrato: string;
  unspsc: string;
  estado: string;
  fecha_firma: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor: number;
  url_secop: string;
  direccion_ejecucion: string;
  localizacion: string;
  secop_updated_at: string;
}

export interface ClasificacionObra {
  isObra: boolean;
  score: number;
  reason: string;
}

export interface GeoResult {
  lat: number;
  lon: number;
  comuna?: string;
  barrio?: string;
  displayName?: string;
  fuente: string;
  confianza: GeoConfianza;
}

export interface SyncResult {
  procesados: number;
  nuevas: number;
  actualizadas: number;
  sin_cambios: number;
  geocodificadas: number;
  sin_ubicacion: number;
  fecha: string;
  durSeg: number;
  error?: string;
}

export type EstadoMapa = "todos" | string;

export interface FiltrosMapa {
  estado?: string;
  entidad?: string;
  minValor?: number;
  maxValor?: number;
  fecha?: string;
}