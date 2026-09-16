import { AnticiposReintegros } from "./anticipos-reintegros";
import { ViajesHotel } from "./viajes-hotel";
import { ViajesItinerario } from "./viajes-itinerario";
import { DynamicFormFieldValue } from "./dynamic-form";

export class Tdr {
    terms_reference_id?: number;
    guid?: string;
    code?: string;
    program_id?: number;
    approval_flow_id?: number;
    description?: string;
    tdr_form?: DynamicFormFieldValue[];
    constructor(data?: Partial<Tdr>) {
        Object.assign(this, data);
    }
}
