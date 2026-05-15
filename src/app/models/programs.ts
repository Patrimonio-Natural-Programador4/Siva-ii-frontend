export class Programs {
  id_programa?: number;
  name?: string;
  description?: string;
  code?: string;

  constructor(data?: Partial<Programs>) {
    Object.assign(this, data);
  }
}
