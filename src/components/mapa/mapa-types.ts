export interface ObraMarcador {
  id: string;
  referencia: string | null;
  nombre: string | null;
  entidad: string | null;
  contratista: string | null;
  estado: string | null;
  valor: number | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  urlSecop: string | null;
  comuna: string | null;
  barrio: string | null;
  direccion: string | null;
  lat: number | null;
  lon: number | null;
  geoFuente: string | null;
  geoConfianza: string | null;
  estadoUbicacion: string | null;
  syncedAt: string | null;
  reportes: {
    total: number;
    promedio_calificacion: number | null;
    en_ejecucion: number;
    con_retraso: number;
    paralizadas: number;
  } | null;
}

export interface TotalesMapa {
  conteo: number;
  resueltas: number;
  pendientes: number;
  sin_ubicacion: number;
}

export interface UlrimaSyncMapa {
  finished_at: string;
  nuevas: number;
  actualizadas: number;
  geocodificadas: number;
  sin_ubicacion: number;
  procesados: number;
}

export interface RespuestaObras {
  success: boolean;
  data: ObraMarcador[];
  meta: {
    totales: TotalesMapa;
    ultimaSync: UlrimaSyncMapa | null;
    filtros: { entidades: string[]; estados: string[] };
  };
}

export interface ResultadoSync {
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

export interface RespuestaActualizar {
  success: boolean;
  resultado?: ResultadoSync;
  totales?: TotalesMapa;
  ultimaSync?: UlrimaSyncMapa | null;
  error?: string;
}

export interface FiltrosMapaUI {
  estado: string;
  entidad: string;
  minValor: string;
  maxValor: string;
  fecha: string;
}