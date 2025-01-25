import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { completeAuthGuard } from './complete-auth.guard';

describe('completeAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => completeAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
