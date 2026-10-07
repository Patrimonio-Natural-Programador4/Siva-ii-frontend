// modelo programas prueba

export class Programs {
  id_programa?: number;
  name?: string;
  description?: string;
  code?: string;
  first_alert_approval?: number;
  secod_alert_approval?: number;

  constructor(data?: Partial<Programs>) {
    Object.assign(this, data);
  }
}
