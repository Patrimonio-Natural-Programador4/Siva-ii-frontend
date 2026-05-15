export class AccesoControles {
  id_acceso_control?: number;
  id_rol?: number;
  id_control?: number;
  acceso_control?: boolean;

  constructor(data?: Partial<AccesoControles>) {
    Object.assign(this, data);
  }
}
