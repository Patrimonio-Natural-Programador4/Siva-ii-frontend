// Modelo evaluacion-capacidades
export class EvaluacionCapacidadesModel {
  id?: number;
  guid?: string;
  name?: string;
  observation?: string;
  approximate_value?: number;
  create_date?: Date | string;
  //create_date?: string;
  policy_approval_date?: Date | string;
  document_signature_date?: Date | string;
  start_date?: Date | string;
  end_date?: Date | string;
  codigo?: string;
  programa?: string;
  program_id?: number;
  pid?: string;
  pid_id?: number;
  implementer?: string;
  implementer_id?: number;
  aproval_request?: string;
  person?: string;
  persons_id?: number;
  capacity_assessments_state?: string;
  capacity_assessments_states_id?: number;
  modalitie?: string;
  modality_id?: number;
  approval_request_id?: number;
  total_registros?: number;
  url_sharepoint_ec?: string | null;

  constructor(data?: Partial<EvaluacionCapacidadesModel>) {
    Object.assign(this, data);
  }
}

export interface EvaluacionCapacidadListSP {
  guid?: string;
  codigo?: string;
  name?: string;
  observation?: string;
  approximate_value?: number;
  implementer_id?: number;
  implementer_name?: string;
  policy_approval_date?: Date | string;
  document_signature_date?: Date | string;
  start_date?: Date | string;
  end_date?: Date | string;
  program_id?: number;
  program_name?: string;
  pid_id?: number;
  pad_name?: string;
  persons_id?: number;
  persons_name?: string;
  capacity_assessments_states_id?: number;
  modality_id?: number;
  modality_name?: string;
  pending_my_approval?: boolean;
  capacity_assessments_id?: number;
  approval_request_id?: number;
  user_id?: number;
  guid_msft?: string;
  step_order_actual_request?: number;
  guid_msft_adjustment?: string;
  total_records?: number;
}

export interface AccionSolicitudAprobacionCapacidad {
  id_solicitud_aprobacion?: number;
  comentarios?: string;
  tipo_accion?: string;
  tipo_solicitud?: string;
  id_usuario_ajuste?: number | null;
  id_rol_aprobacion_ajuste?: number | null;
  orden_actual?: number;
}
