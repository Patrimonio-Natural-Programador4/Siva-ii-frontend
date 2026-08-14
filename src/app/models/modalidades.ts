// modelo programas prueba

export class ModalidadModel {
  id?: number;
  name?: string;
  constructor(data?: Partial<ModalidadModel>) {
    Object.assign(this, data);
  }
}
