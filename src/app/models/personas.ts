// modelo programas prueba

export class PersonModel {
  id?: number;
  first_name?: string;
  other_name?: string;
  identification_type?: number;
  last_name?: string;
  other_last_name?: string;
  email?: string;
  phone?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
  constructor(data?: Partial<PersonModel>) {
    Object.assign(this, data);
  }
}
