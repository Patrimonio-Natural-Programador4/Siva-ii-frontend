export class ViajesItinerario {
    id_viaje_itinerario?: number;
    id_viaje?: number;
    fecha?: Date;
    fecha_regreso?: Date;
    id_municipio_destino?: number;
    id_municipio_origen?: number;
    hora?: string;
    observaciones?: string;
    vereda_origen?: string;
    destino_vereda?: boolean;
    origen_vereda?: boolean;
    vereda_destino?: string;
    id_departamento_destino?: number;
    id_departamento_origen?: number;
    departamento_destino?: string;
    departamento_origen?: string;
    municipio_destino?: string;
    municipio_origen?: string;
    observaciones_adicionales?: string;
    fecha_hora?: Date;
    nombre_archivo?: string;
    tipo_archivo?: string;
    tamano_archivo?: number;
    selectedFile?: File;
    soporte_tiquetes?: string;
    es_zona_rural?: boolean;
    observaciones_zona_rural?: string;
    soporte_pase_abordar?: string;
    requiere_tiquetes_aereos?: boolean;
    id_proyecto?: number | null;
    id_rubro?: number | null;
    proyecto?: string;
    rubro?: string;
    regreso?: boolean;
    hora_regreso?: string;
    padre?: string;
    constructor(data?: Partial<ViajesItinerario>) {
        Object.assign(this, data);
    }
}
