export interface DocumentoAsociadoEvaluacionCapacidades {
  id?: number;
  attachment_name?: string;
  documents_types_agreements_id?: number;
  document_type_description?: string | null;
  observations?: string | null;
}

export interface DocumentoAsociadoEvaluacionCapacidadesCreate {
  attachment_name: string;
  base64_data: string;
  documents_types_agreements_id?: number | null;
  observations?: string | null;
}

export interface DocumentoAsociadoEvaluacionCapacidadesUpdate {
  attachment_name?: string | null;
  base64_data?: string | null;
  documents_types_agreements_id?: number | null;
  observations?: string | null;
}
