export interface SolicitudAprobacionHistorial {
  id_historial?: number;
  id_solicitud_aprobacion?: number;
  id_registro_asociado?: number;
  id_flujo_aprobacion?: number;
  id_categoria?: number;
  id_estado_aprobacion_solicitud?: number;
  id_rol_aprobacion?: number;
  id_usuario?: number;
  id_estado_aprobacion_ruta?: number;
  fecha_aprobacion?: string;
  fecha_crea?: string;
  observaciones?: string;
  id_ruta?: number;
  orden?: number;
  rol?: string;
  usuario?: string;
  categoria_aprobacion?: string;
  guid?: string;
  estado_aprobacion_ruta?: string;
}