import { RolesAprobacionUsuarios } from './roles-aprobacion-usuarios';

export class RolesAprobacion {
  id_rol_aprobacion?: number;
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  usuarios?: RolesAprobacionUsuarios[];

  constructor(data?: Partial<RolesAprobacion>) {
    this.usuarios = [];
    Object.assign(this, data);
  }
}