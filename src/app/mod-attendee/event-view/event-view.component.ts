import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { EventService } from '../../services/event.service';
import { SessionService } from '../../services/session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, EMPTY, map, shareReplay, switchMap, tap } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { EventRegisterService } from '../../services/event-register.service';
import { MatDialog } from '@angular/material/dialog';
import { AttendeeMeetingDialogComponent } from '../../components/attendee-meeting-dialog/attendee-meeting-dialog.component';
import { Location, AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { UtilService } from '../../services/util.service';
import { PageLoadingComponent } from '../../shared/page-loading/page-loading.component';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { EventDetailsCardComponent } from '../../shared/event-details-card/event-details-card.component';
import { SessionDetailsCardComponent } from '../../shared/session-details-card/session-details-card.component';

@Component({
    selector: 'app-event-view',
    templateUrl: './event-view.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './event-view.component.scss',
    imports: [PageLoadingComponent, OutletInnerComponent, MatButton, MatIcon, EventDetailsCardComponent, SessionDetailsCardComponent, AsyncPipe]
})
export class EventViewComponent {
  private eventService = inject(EventService);
  private sessionService = inject(SessionService);
  private aroute = inject(ActivatedRoute);
  private route = inject(Router);
  private commonService = inject(CommonService);
  private eventRegisterService = inject(EventRegisterService);
  private refresh$ = new BehaviorSubject(null);
  private dialog = inject(MatDialog);
  location = inject(Location);
  util = inject(UtilService);

  isLoading = signal(true);

  event$ = combineLatest([this.aroute.params, this.refresh$]).pipe(
    switchMap(([params]: any) => this.eventService.getOneById(params.id).pipe(
      map((res) => res.data),
      tap(() => this.isLoading.set(false)),
      catchError(() => {
        this.isLoading.set(false);
        this.route.navigateByUrl("attendee/dashboard/not-found");
        return EMPTY;
      })
    )),
    shareReplay(1)
  );

  sessions$ = this.aroute.params.pipe(
    switchMap((params: any) => this.sessionService.getAll(params.id)),
    map((res) => res.data),
    shareReplay(1)
  );

  private participation$ = this.event$.pipe(
    map((event) => event.participation ?? { state: 'none' as const, meeting_started: false }),
    shareReplay(1)
  );

  has_registered$ = this.participation$.pipe(map((p) => p.state === 'registered'));
  is_register_approved$ = this.participation$.pipe(map((p) => p.state === 'registration_approved'));
  is_invited$ = this.participation$.pipe(map((p) => p.state === 'invited'));
  is_invite_accepted$ = this.participation$.pipe(map((p) => p.state === 'invitation_accepted'));
  has_meeting_started$ = this.participation$.pipe(map((p) => p.meeting_started));

  constructor() {}

  register(event_id: string) {
    this.eventRegisterService.register(event_id).subscribe({
      next: (res) => {
        this.refresh$.next(null);
        this.commonService.openSnackBar(res.message);
      },
      error: (err) => {
        if (err instanceof HttpErrorResponse) {
          this.commonService.openSnackBar(err.error.message);
        }
      }
    });
  }

  unregister(event_id: string) {
    const isConfirmed = confirm("Are you sure to unregister this event?");

    if (isConfirmed) {
      this.eventRegisterService.unregister(event_id).subscribe({
        next: (res) => {
          this.refresh$.next(null);
          this.commonService.openSnackBar(res.message);
        },
        error: (err) => {
          if (err instanceof HttpErrorResponse) {
            this.commonService.openSnackBar(err.error.message);
          }
        }
      });
    }
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
