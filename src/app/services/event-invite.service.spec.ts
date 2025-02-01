import { TestBed } from '@angular/core/testing';

import { EventInviteService } from './event-invite.service';

describe('EventInviteService', () => {
  let service: EventInviteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventInviteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
