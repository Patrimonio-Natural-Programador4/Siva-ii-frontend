import { AccesoControles } from './acceso-controles';
import { AccesoModulos } from './acceso-modulos';

export class Roles {
  id_rol?: number;
  rol?: string;
  descripcion?: string;
  acceso_modulos?: AccesoModulos[];
  acceso_controles?: AccesoControles[];

  constructor(data?: Partial<Roles>) {
    this.acceso_modulos = [];
    this.acceso_controles = [];
    Object.assign(this, data);
  }
}
