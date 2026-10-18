export class TipoAcuerdoModel {
  id?: number;
  name?: string;
  codee?: string;
  description?: string;
  is_independent?: string;
  color?: string;

  constructor(data?: Partial<TipoAcuerdoModel>) {
    Object.assign(this, data);
  }
}
