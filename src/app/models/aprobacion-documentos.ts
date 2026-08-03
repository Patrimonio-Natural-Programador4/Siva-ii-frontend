// Apobacion documentos ts
export class AprobacionDocumentos {
  id?: number;
  approval_category_id?: number;
  program_id?: number;
  documento?: string;

  constructor(data?: Partial<AprobacionDocumentos>) {
    Object.assign(this, data);
  }
}
