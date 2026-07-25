export class ViajesHotel {
    id_viaje_hotel?: number;
    id_viaje?: number;
    id_municipio?: number;
    observaciones?: string;
    fecha_llegada?: Date;
    fecha_salida?: Date;
    id_departamento?: number;
    departamento?: string;
    municipio?: string;
    tipo_alojamiento?: string;
    soporte?: string; // Ruta del soporte del hotel
    nombre_archivo?: string;
    tipo_archivo?: string;
    tamano_archivo?: number;
    selectedFile?: File;
    pago_gestiona_fundacion?: boolean;
    id_proyecto?: number | null;
    id_rubro?: number | null;
    proyecto?: string;
    rubro?: string;

    constructor(
        id_viaje_hotel?: number,
        id_viaje?: number,
        id_municipio?: number,
        observaciones?: string,
        fecha_llegada?: Date,
        fecha_salida?: Date,
        id_departamento?: number,
        departamento?: string,
        municipio?: string,
        tipo_alojamiento?: string,
        soporte?: string,
        pago_gestiona_fundacion?: boolean,
        id_proyecto?: number | null,
        id_rubro?: number | null
    ) {
        this.id_viaje_hotel = id_viaje_hotel;
        this.id_viaje = id_viaje;
        this.id_municipio = id_municipio;
        this.observaciones = observaciones;
        this.fecha_llegada = fecha_llegada;
        this.fecha_salida = fecha_salida;
        this.id_departamento = id_departamento;
        this.departamento = departamento;
        this.municipio = municipio;
        this.tipo_alojamiento = tipo_alojamiento;
        this.soporte = soporte;
        this.pago_gestiona_fundacion = pago_gestiona_fundacion;
        this.id_proyecto = id_proyecto;
        this.id_rubro = id_rubro;
    }
}

