import { TestBed } from '@angular/core/testing';

import { EventCacheService } from './event-cache.service';

describe('EventCacheService', () => {
  let service: EventCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
