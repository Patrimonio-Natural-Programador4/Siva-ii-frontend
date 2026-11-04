import { TestBed } from '@angular/core/testing';

import { Pilares } from './pilares';

describe('Pilares', () => {
  let service: Pilares;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pilares);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
