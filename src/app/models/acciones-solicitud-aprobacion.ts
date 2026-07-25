import { Viajes } from './viajes';

export interface UsuarioDisponibleAjuste {
  id_rol_aprobacion_ajuste?: number;
  usuario?: string;
  id_usuario_ajuste?: number;
}

export interface AccionesSolicitudAprobacion {
  id_solicitud_aprobacion?: number;
  comentarios?: string;
  tipo_accion?: string;
  viaje?: Viajes;
  tipo_solicitud?: string;
  asigna_presupuesto_viajes?: boolean;
  ajusta_itinerario_viajes?: boolean;
  valida_soportes?: boolean;
  valida_soportes_hotel?: boolean;
  deshabilita_conceptos_anticipo?: boolean;
  agrega_rpc?: boolean;
  agrega_documento_contable?: boolean;
  agrega_tarjeta_asistencia_medica?: boolean;
  agrega_comprobante_egreso?: boolean;
  habilitar_pago?: boolean;
  orden_actual?: number;
  id_estado_aprobacion_ruta?: number;
  usuarios_disponibles_ajustes?: UsuarioDisponibleAjuste[];
  usuario_solicito?: boolean;
  id_usuario_ajuste?: number | null;
  id_rol_aprobacion_ajuste?: number | null;
  habilitar_solicitar_ajustes?: boolean;
  id_estado_solicitud?: number;
  id_usuarios_mencion?: number[];
}