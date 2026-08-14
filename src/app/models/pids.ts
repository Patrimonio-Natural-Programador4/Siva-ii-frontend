// modelo programas prueba

export class PidModel {
  id?: number;
  pad_id?: number;
  name?: string;
  description?: string;
  color?: string;
  pad?: string;
  eur_usd_rate?: number;
  usd_cop_rate?: number;
  eur_cop_rate?: number;
  sicof_code?: string;
  constructor(data?: Partial<PidModel>) {
    Object.assign(this, data);
  }
}
