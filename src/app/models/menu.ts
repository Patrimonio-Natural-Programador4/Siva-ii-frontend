export class Menu {
    id_menu?: number;
    nombre_menu?: string;
    id_menu_padre?: number;
    orden_menu?: number;
    id_modulo?: number;
    icono?: string;
    url?: string;
    valor_padre?: string;
    orden_padre?: number;
    id_rol?: number;
    icono_padre?: string;
    url_padre?: string;

    constructor(data?: Partial<Menu>) {
        Object.assign(this, data);
    }
}
