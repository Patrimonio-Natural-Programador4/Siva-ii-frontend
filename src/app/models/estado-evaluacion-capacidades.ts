// modelo programas prueba

export class CapacityAssessmentStateModel {
  id?: number;
  state?: string;

  constructor(data?: Partial<CapacityAssessmentStateModel>) {
    Object.assign(this, data);
  }
}
