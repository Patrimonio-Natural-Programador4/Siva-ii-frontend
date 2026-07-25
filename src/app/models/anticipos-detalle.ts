export class AnticiposDetalle {
    id_anticipo_detalle?: number;
    id_concepto?: number;
    valor_anticipo?: number;
    concepto?: string;
    observaciones?: string;
    id_anticipo?: number;
    modificado?: boolean;
    deshabilitado?: boolean;
    constructor(data?: Partial<AnticiposDetalle>) {
        Object.assign(this, data);
    }
}
