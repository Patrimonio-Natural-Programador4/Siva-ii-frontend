export class RolesAprobacionUsuarios {
  id_rol_usuario?: number;
  id_rol_aprobacion?: number;
  id_usuario?: number;
  activo?: boolean;
  usuario?: string;
  area?: string;
  correo?: string;

  constructor(data?: Partial<RolesAprobacionUsuarios>) {
    Object.assign(this, data);
  }
}