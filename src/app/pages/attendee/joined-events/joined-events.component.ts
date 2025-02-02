import { Component, inject } from '@angular/core';
import { EventRegisterService } from '../../../services/event-register.service';
import { EventInviteService } from '../../../services/event-invite.service';
import { map } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-joined-events',
  templateUrl: './joined-events.component.html',
  styleUrl: './joined-events.component.scss'
})
export class JoinedEventsComponent {
  private eventRegisterService = inject(EventRegisterService);
  private eventInviteService = inject(EventInviteService);

  constructor() {}

  registered_events$ = this.eventRegisterService.getAllByUserId().pipe(
    map((res) => res.data)
  );

  accepted_events$ = this.eventInviteService.getAllAcceptedByUserId().pipe(
    map((res) => res.data)
  );
}
