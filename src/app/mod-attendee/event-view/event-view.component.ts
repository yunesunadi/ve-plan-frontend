import { Component, computed, effect, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { EventService } from '../../services/event.service';
import { SessionService } from '../../services/session.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, filter, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { ConfirmService } from '../../services/confirm.service';
import { EventRegisterService } from '../../services/event-register.service';
import { MatDialog } from '@angular/material/dialog';
import { AttendeeMeetingDialogComponent } from '../../components/attendee-meeting-dialog/attendee-meeting-dialog.component';
import { AsyncPipe } from '@angular/common';
import { ApiError } from '../../models/ApiError';
import { Event } from '../../models/Event';
import { UtilService } from '../../services/util.service';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { EventDetailsCardComponent } from '../../shared/event-details-card/event-details-card.component';
import { SessionDetailsCardComponent } from '../../shared/session-details-card/session-details-card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
    selector: 'app-event-view',
    templateUrl: './event-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './event-view.component.scss',
    imports: [OutletInnerComponent, PageHeaderComponent, ErrorStateComponent, EmptyStateComponent, MatButton, MatIcon, EventDetailsCardComponent, SessionDetailsCardComponent, AsyncPipe]
})
export class EventViewComponent {
  private eventService = inject(EventService);
  private sessionService = inject(SessionService);
  private aroute = inject(ActivatedRoute);
  private commonService = inject(CommonService);
  private confirmService = inject(ConfirmService);
  private eventRegisterService = inject(EventRegisterService);
  private dialog = inject(MatDialog);
  util = inject(UtilService);

  event = input.required<Event>();

  private eventOverride = signal<Event | null>(null);
  displayEvent = computed(() => this.eventOverride() ?? this.event());
  private displayEvent$ = toObservable(this.displayEvent);

  sessionsError = signal<ApiError | null>(null);
  private fetchSessions$ = new BehaviorSubject(null);

  constructor() {
    effect(() => {
      this.event();
      this.eventOverride.set(null);
    });
  }

  sessions$ = this.fetchSessions$.pipe(
    tap(() => this.sessionsError.set(null)),
    switchMap(() => this.aroute.params),
    switchMap((params: any) => this.sessionService.getAll(params.id)),
    map((res) => res.data),
    catchError((err: ApiError) => {
      this.sessionsError.set(err);
      return of([]);
    }),
    shareReplay(1)
  );

  private participation$ = this.displayEvent$.pipe(
    map((event) => event.participation ?? { state: 'none' as const, meeting_started: false }),
    shareReplay(1)
  );

  has_registered$ = this.participation$.pipe(map((p) => p.state === 'registered'));
  is_register_approved$ = this.participation$.pipe(map((p) => p.state === 'registration_approved'));
  is_invited$ = this.participation$.pipe(map((p) => p.state === 'invited'));
  is_invite_accepted$ = this.participation$.pipe(map((p) => p.state === 'invitation_accepted'));
  has_meeting_started$ = this.participation$.pipe(map((p) => p.meeting_started));

  private refetchEvent(event_id: string) {
    this.eventService.getOneById(event_id).subscribe({
      next: (res) => this.eventOverride.set(res.data),
    });
  }

  register(event_id: string) {
    this.eventRegisterService.register(event_id).subscribe({
      next: (res) => {
        this.refetchEvent(event_id);
        this.commonService.success(res.message);
      },
      error: (err) => {
        if (err instanceof ApiError) {
          this.commonService.error(err);
        }
      }
    });
  }

  unregister(event_id: string) {
    this.confirmService.confirm({
      title: "Unregister from this event?",
      body: "You'll lose your place and any approval you've been granted.",
      confirmLabel: "Unregister",
      destructive: true,
    }).pipe(
      filter(Boolean),
      switchMap(() => this.eventRegisterService.unregister(event_id))
    ).subscribe({
      next: (res) => {
        this.refetchEvent(event_id);
        this.commonService.success(res.message);
      },
      error: (err) => {
        if (err instanceof ApiError) {
          this.commonService.error(err);
        }
      }
    });
  }

  retrySessions() {
    this.fetchSessions$.next(null);
  }

  joinMeeting(event_id: string) {
    this.dialog.open(AttendeeMeetingDialogComponent, {
      width: "calc(100% - 10px)",
      maxWidth: "100%",
      height: "calc(100% - 10px)",
      maxHeight: "100%",
      disableClose: true,
      data: {
        event_id
      }
    });
  }

}
