// Modelo tipos-documento-acuerdos
export class TipoDocumentoAcuerdoModel {
  id?: number;
  is_required?: boolean;
  description?: string;
  number?: number;
  code?: string;
  template?: string;
  template_path?: string;
  is_active?: boolean;
  documents_approval_id?: number;
  documents_approval?: string;

  constructor(data?: Partial<TipoDocumentoAcuerdoModel>) {
    Object.assign(this, data);
  }
}
