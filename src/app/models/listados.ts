import { ListaGenerica } from './lista-generica';

export class Listados {
  id_listado?: number;
  tipo_listado?: string;
  lista_generica?: ListaGenerica[];

  constructor(data?: Partial<Listados>) {
    Object.assign(this, data);
  }
}
