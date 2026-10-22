export class PilarModel {
  id?: number;
  name?: string;
  description?: string;
  color?: string;
  person_id?: number;
  person?: string;

  constructor(data?: Partial<PilarModel>) {
    Object.assign(this, data);
  }
}
