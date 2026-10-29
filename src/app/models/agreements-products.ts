export interface ProductoEstudio {
  modificar?: boolean;
  client_id?: string;
  id?: number;
  code: string | null;
  product: string | null;
  unit_measure?: string | null;
  quantity?: number | string | null;
  observations?: string | null;
  state_id?: number | null;
}

export interface ActividadEstudio extends ProductoEstudio {
  productos: ProductoEstudio[];
}

export interface ObjetivoEstudio extends ProductoEstudio {
  actividades: ActividadEstudio[];
}

export type TipoProductoEstudio = 'objetivo' | 'actividad' | 'producto';

export interface ProductosFormData {
  registro?: ProductoEstudio;
  tipo: TipoProductoEstudio;
  padre?: string;
  codigosExistentes?: (string | null)[];
}
