export class UsuarioDelegado {
  id_usuario?: number;
  nombre?: string;

  constructor(data?: Partial<UsuarioDelegado>) {
    Object.assign(this, data);
  }
}

export class DelegacionRolesUsuarios {
  id_delegacion_roles_usuarios?: number;
  id_usuario?: number;
  id_rol_aprobacion?: number;
  ids_usuarios_delegados?: number[];
  usuario?: string;
  rol_aprobacion?: string;
  usuarios_delegados?: UsuarioDelegado[];

  constructor(data?: Partial<DelegacionRolesUsuarios>) {
    this.ids_usuarios_delegados = [];
    this.usuarios_delegados = [];
    Object.assign(this, data);
  }
}