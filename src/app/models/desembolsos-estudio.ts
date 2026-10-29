import { ObjetivoEstudio } from './agreements-products';

export interface DesembolsoEstudio {
  id?: number;
  number_disbursement: number | null;
  scheduled_date: string | null;
  value: number | string | null;
  state_id: number | null;
  request_date?: string | null;
  validation_date?: string | null;
  approval_date?: string | null;
  disbursement_date?: string | null;
  documento_soporte?: string | null;
  observations?: string | null;
  product_keys: string[];
}

export interface EstadoDesembolso {
  id: number;
  name: string | null;
}

export interface ProductoDesembolsoOpcion {
  key: string;
  nombre: string;
  usado: boolean;
}

export interface DesembolsoFormData {
  productos: ProductoDesembolsoOpcion[];
  estados: EstadoDesembolso[];
  desembolso?: DesembolsoEstudio;
}

export function productosParaDesembolso(
  objetivos: ObjetivoEstudio[],
  desembolsos: DesembolsoEstudio[]
): ProductoDesembolsoOpcion[] {
  const usados = new Set(desembolsos.flatMap(d => d.product_keys));
  return objetivos.flatMap(objetivo =>
    objetivo.actividades.flatMap(actividad =>
      actividad.productos.map(producto => {
        const key = producto.id ? `id:${producto.id}` : `new:${producto.client_id}`;
        return {
          key,
          nombre: `${producto.code ?? ''} - ${producto.product ?? ''} (Objetivo ${objetivo.code ?? ''} - Actividad ${actividad.code ?? ''})`,
          usado: usados.has(key),
        };
      })
    )
  );
}
