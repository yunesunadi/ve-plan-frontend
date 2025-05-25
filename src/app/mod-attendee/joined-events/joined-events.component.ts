import { Component, inject } from '@angular/core';
import { EventRegisterService } from '../../services/event-register.service';
import { EventInviteService } from '../../services/event-invite.service';
import { map, shareReplay } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-joined-events',
  templateUrl: './joined-events.component.html',
  styleUrl: './joined-events.component.scss'
})
export class JoinedEventsComponent {
  private eventRegisterService = inject(EventRegisterService);
  private eventInviteService = inject(EventInviteService);
  location = inject(Location);

  constructor() {}

  registered_events$ = this.eventRegisterService.getAllByUserId().pipe(
    map((res) => res.data),
    shareReplay(1)
  );

  accepted_events$ = this.eventInviteService.getAllAcceptedByUserId().pipe(
    map((res) => res.data),
    shareReplay(1)
  );
}
