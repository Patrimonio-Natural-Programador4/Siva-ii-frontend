import { FlujosAprobacionRuta } from './flujos-aprobacion-ruta';

export class FlujosAprobacion {
  id_flujo_aprobacion?: number;
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  categoria?: string;
  rutas?: FlujosAprobacionRuta[];
  id_categoria?: number;
  id_programa?: number | null;
  programa?: string | null;

  constructor(data?: Partial<FlujosAprobacion>) {
    this.rutas = [];
    Object.assign(this, data);
  }
}