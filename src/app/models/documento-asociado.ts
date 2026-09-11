export interface DocumentoAsociado {
  id?: number;
  attachment_name?: string;
  document_type_id?: number;
  observaciones?: string;
}

export interface DocumentoAsociadoCreate {
  nombre_original: string;
  base64_data: string;
  document_type_id: number;
  observaciones: string;
}
