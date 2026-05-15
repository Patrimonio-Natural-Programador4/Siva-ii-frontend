export class FlujosAprobacionRuta {
  id_ruta?: number;
  id_flujo_aprobacion?: number;
  id_rol_aprobacion?: number;
  orden?: number;
  activo?: boolean;
  rol?: string;
  descripcion?: string;

  constructor(data?: Partial<FlujosAprobacionRuta>) {
    Object.assign(this, data);
  }
}