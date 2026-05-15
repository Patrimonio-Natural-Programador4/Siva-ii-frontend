export class ListaGenerica {
  identity?: number;
  valor?: string;
  idrelacion?: number;
  valor_referencia?: string;
  valorNumerico?: number;
  valorNumerico2?: number;
  valor_referencia2?: string;
  valor_referencia3?: string;
  valorNumerico3?: number;
  checked?: boolean;
  aplicaValidacion?: boolean;
  aplicaSegundaValidacion?: boolean;

  constructor(data?: Partial<ListaGenerica>) {
    Object.assign(this, data);
  }
}
