// modelo programas prueba

export class ImplementerModel {
  id?: number;
  acronym?: string;
  name?: string;
  identification_type?: number;
  type_id?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
  constructor(data?: Partial<ImplementerModel>) {
    Object.assign(this, data);
  }
}
