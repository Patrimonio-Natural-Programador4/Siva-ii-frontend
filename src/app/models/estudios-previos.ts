export class PreviousStudiesModel {
  id?: number;
  precedents?: string;
  justification?: string;
  scope?: string;
  overall_objective?: string;
  term?: string;
  obligations?: string;
  supervisor?: string;
  user_session?: number;
  create_date?: string | Date;
  total_value?: number;
  contributions_ei?: number;
  total_value_executes_fpn?: number;
  total_value_executes_ei?: number;
  previous_studies_states_id?: number;
  prev_studies_state?: string;
  app_request?: string;
  implementer_id?: number;
  implementers?: string;
  persons?: string;
  persons_id?: number;
  capacity_assessment?: string;
  capacity_assessment_id?: number;
  contributions_fpn?: number;
  estimated_term?: string;
  programs?: string;
  program_id?: number;
  code?: string;
  approval_request_id?: number;
  guid?: string;
  total_registros?: number;
  capacity_assessments_states_id?: number;

  constructor(data?: Partial<PreviousStudiesModel>) {
    Object.assign(this, data);
  }
}

export class PreviousStudiesCreateModel {
  id?: number;
  precedents?: string;
  justification?: string;
  scope?: string;
  overall_objective?: string;
  term?: string;
  obligations?: string;
  supervisor?: string;
  user_session?: number;
  create_date?: string | Date;
  total_value?: number;
  contributions_ei?: number;
  total_value_executes_fpn?: number;
  total_value_executes_ei?: number;
  previous_studies_states_id?: number;
  implementer_id?: number;
  persons?: string;
  persons_id?: number;
  capacity_assessment_id?: number;
  capacity_assessment?: string;
  aproval_request?: string;
  approval_request_id?: number;
  contributions_fpn?: number;
  estimated_term?: string;
  program_id?: number;
  guid?: string;

  constructor(data?: Partial<PreviousStudiesCreateModel>) {
    Object.assign(this, data);
  }
}

export class PreviousStudiesListModel {
  id?: number;
  precedents?: string;
  justification?: string;
  scope?: string;
  overall_objective?: string;
  term?: string;
  obligations?: string;
  supervisor?: string;
  user_session?: number;
  create_date?: string | Date;
  total_value?: number;
  contributions_ei?: number;
  total_value_executes_fpn?: number;
  total_value_executes_ei?: number;
  prev_studies_state?: number;
  previous_studies_states_id?: number;
  implementer_id?: number;
  implementer?: string;
  persons?: string;
  persons_email?: string;
  persons_id?: number;
  capacity_assessment_id?: number;
  capacity_assessment?: string;
  aproval_request?: string;
  approval_request_id?: number;
  contributions_fpn?: number;
  estimated_term?: string;
  program_id?: number;
  program_name?: string;
  code?: string;
  guid?: string;
  pending_my_approval?: boolean;
  user_id?: number;
  guid_msft?: string;
  step_order_actual_request?: number;
  guid_msft_adjustment?: string;
  total_records?: number;

  constructor(data?: Partial<PreviousStudiesListModel>) {
    Object.assign(this, data);
  }
}
