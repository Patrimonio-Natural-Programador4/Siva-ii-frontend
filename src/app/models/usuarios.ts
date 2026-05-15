// import { Roles } from "./roles";

export class Usuarios {
    id?: number;
    guid?: string;
    guid_msft?: string;
    first_name?: string;
    last_name?: string;
    identification_type?: number;
    identification_number?: number;
    email?: string;
    is_active?: boolean;
    other_name?: string;
    other_last_name?: string;
    position?: string;
    full_name?: string;
    program_ids?: number[];
    role_ids?: number[];
    // roles?: Roles[];
    constructor(
        data?: Partial<Usuarios>
    ) {
        this.program_ids = [];
        this.role_ids = [];
        Object.assign(this, data);
    }
}
