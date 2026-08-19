export class PreviousStudiesModel {
  id?: number;
  precedents?: string;
  justification?: string;
  scope?: string;
  overall_objective?: string;
  term?: string;
  obligations?: string;
  supervisor?: string;
  //user_session?: number;
  //create_date?: string | Date;
  total_value?: number;
  contributions_ei?: number;
  total_value_executes_fpn?: number;
  total_value_executes_ei?: number;
  cap_assessments_state?: number;
  app_request?: number;
  implementers?: number;
  persons?: number;
  capacity_assessment?: string;
  contributions_fpn?: number;
  estimated_term?: string;
  capacity_assessments_states_id?: number;
  implementer_id?: number;
  persons_id?: number;
  capacity_assessment_id?: number;
  approval_request_id?: number;

  constructor(data?: Partial<PreviousStudiesModel>) {
    Object.assign(this, data);
  }
}
