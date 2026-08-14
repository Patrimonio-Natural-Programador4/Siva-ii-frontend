import { TestBed } from '@angular/core/testing';

import { EvaluacionCapacidadesService } from './evaluacion-capacidades.service';

describe('EvaluacionCapacidadesService', () => {
  let service: EvaluacionCapacidadesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvaluacionCapacidadesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
