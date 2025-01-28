import { Component, inject } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { SessionService } from '../../../services/session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, concatMap, EMPTY, map, shareReplay, switchMap } from 'rxjs';
import { CommonService } from '../../../services/common.service';
import { EventRegisterService } from '../../../services/event-register.service';

@Component({
  standalone: false,
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  styleUrl: './event-view.component.scss'
})
export class EventViewComponent {
  private eventService = inject(EventService);
  private sessionService = inject(SessionService);
  private aroute = inject(ActivatedRoute);
  private route = inject(Router);
  private commonService = inject(CommonService);
  private eventRegisterService = inject(EventRegisterService);

  event$ = this.aroute.params.pipe(
    switchMap((params: any) => this.eventService.getOneById(params.id)),
    map((res) => res.data),
    catchError(() => {
      this.route.navigateByUrl("attendee/dashboard/not-found");
      return EMPTY;
    }),
    shareReplay(1)
  );

  sessions$ = this.aroute.params.pipe(
    switchMap((params: any) => this.sessionService.getAll(params.id)),
    map((res) => res.data),
    shareReplay(1)
  );

  has_registered$ = this.fetchHasRegistered();

  constructor() {}

  fetchHasRegistered() {
    return this.event$.pipe(
      concatMap((event) => this.eventRegisterService.hasRegistered(event._id).pipe(
        map((res) => res.has_registered)
      ))
    );
  }

  register(event_id: string) {
    this.eventRegisterService.register(event_id).subscribe({
      next: (res) => {
        this.has_registered$ = this.fetchHasRegistered();
        this.commonService.openSnackBar(res.message);
      }
    });
  }

  unregister(event_id: string) {
    this.eventRegisterService.unregister(event_id).subscribe({
      next: (res) => {
        this.has_registered$ = this.fetchHasRegistered();
        this.commonService.openSnackBar(res.message);
      }
    });
  }
}
