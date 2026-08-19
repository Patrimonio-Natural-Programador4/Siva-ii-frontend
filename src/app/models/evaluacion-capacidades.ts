// Modelo evaluacion-capacidades
export class EvaluacionCapacidadesModel {
  id?: number;
  name?: string;
  observation?: string;
  approximate_value?: number;
  //create_date?: string;
  policy_approval_date?: string;
  document_signature_date?: string;
  start_date?: string;
  end_date?: string;
  code?: string;
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

  constructor(data?: Partial<EvaluacionCapacidadesModel>) {
    Object.assign(this, data);
  }
}
