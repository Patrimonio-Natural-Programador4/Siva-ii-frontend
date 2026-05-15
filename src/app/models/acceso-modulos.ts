export class AccesoModulos {
  id_acceso_modulo?: number;
  id_rol?: number;
  id_modulo?: number;
  acceso_modulo?: boolean;
  descripcion?: string;
  modulo?: string;

  constructor(data?: Partial<AccesoModulos>) {
    Object.assign(this, data);
  }
}
