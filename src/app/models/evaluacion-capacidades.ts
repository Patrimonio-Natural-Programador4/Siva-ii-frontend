// Modelo evaluacion-capacidades
export class EvaluacionCapacidadesModel {
  id?: number;
  name?: string;
  observation?: string;
  approximate_value?: number;
  create_date?: string;
  policy_approval_date?: string;
  document_signature_date?: string;
  start_date?: string;
  end_date?: string;
  code?: string;
  programa?: string;
  pid?: string;
  implementer?: string;
  aproval_request?: string;
  person?: string;
  capacity_assessments_state?: string;
  modalitie?: string;

  constructor(data?: Partial<EvaluacionCapacidadesModel>) {
    Object.assign(this, data);
  }
}
