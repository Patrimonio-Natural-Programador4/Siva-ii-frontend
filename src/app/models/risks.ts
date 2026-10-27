export class RisksModel {
  id?: number;
  risk?: string;
  mitigation?: string;
  previous_studies_id?: number;

  constructor(data: Partial<RisksModel> = {}) {
    Object.assign(this, data);
  }
}
