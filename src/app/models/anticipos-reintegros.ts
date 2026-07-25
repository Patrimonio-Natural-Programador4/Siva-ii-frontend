import { AnticiposDetalle } from "./anticipos-detalle";

export class AnticiposReintegros {
    id_anticipo?: number;
    id_relacion?: number;
    id_tipo_anticipo?: number;
    codigo?: string;
    soporte_pago?: string;
    estado?: string;
    fecha_crea?: Date;
    // fecha_sube_soporte_pago?: Date;
    detalle?: AnticiposDetalle[];
    nombre_tercero?: string;
    numero_cuenta?: string;
    id_entidad_bancaria?: number;
    // ruta_soporte_pago?: string;
    codigo_instrumento?: string;
    valor?: number;
    id_tipo_cuenta?: number;
    // numero_retiros?: number;
    // gastos_bancarios?: number;
    total_gasto?: number;
    // rpc?: string;
    // ruta_rpc?: string;
    // documento_contable?: string;
    // ruta_documento_contable?: string
    id_estado?: number;
    // documento_consignacion_bancaria?: string;
    // ruta_documento_consignacion_bancaria?: string;
    // comprobante_egreso?: string;
    // ruta_comprobante_egreso?: string;
    guid_relacion?: string;
    es_reintegro?: boolean;
    // diminucion_rpc?: string;
    // ruta_diminucion_rpc?: string;
    // documento_legalizacion?: string;
    // ruta_documento_legalizacion?: string;
    // documento_soporte?: string;
    // ruta_documento_soporte?: string;
    constructor(data?: Partial<AnticiposReintegros>) {
        Object.assign(this, data);
    }
}