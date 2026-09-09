import { Component, computed, effect, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { EventService } from '../../services/event.service';
import { CommonService } from '../../services/common.service';
import { ConfirmService } from '../../services/confirm.service';
import { EventRegisterService } from '../../services/event-register.service';
import { AttendeeMeetingDialogComponent } from '../../components/attendee-meeting-dialog/attendee-meeting-dialog.component';
import { Event } from '../../models/Event';
import { ApiError } from '../../models/ApiError';
import { UtilService } from '../../services/util.service';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/ui/status-chip/status-chip.component';
import { EventViewStore } from '../../shared/event-view/event-view-store';

@Component({
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './event-view.component.scss',
  providers: [EventViewStore],
  imports: [
    OutletInnerComponent, PageHeaderComponent, StatusChipComponent, MatButton, MatIcon,
    RouterLink, RouterLinkActive, RouterOutlet,
  ],
})
export class EventViewComponent {
  private eventService = inject(EventService);
  private commonService = inject(CommonService);
  private confirmService = inject(ConfirmService);
  private eventRegisterService = inject(EventRegisterService);
  private dialog = inject(MatDialog);
  protected util = inject(UtilService);
  protected store = inject(EventViewStore);

  event = input.required<Event>();

  private eventOverride = signal<Event | null>(null);
  protected displayEvent = computed(() => this.eventOverride() ?? this.event());

  protected readonly participation = computed(() => {
    const event = this.displayEvent();
    return {
      state: event.participation?.state ?? 'none',
      meetingStarted: event.participation?.meeting_started ?? false,
      expired: this.util.is_event_expired(event),
    };
  });

  constructor() {
    effect(() => {
      this.event();
      this.eventOverride.set(null);
    });

    effect(() => this.store.setEvent(this.displayEvent()));
  }

  private refetch(eventId: string): void {
    this.eventService.getOneById(eventId).subscribe({
      next: (res) => this.eventOverride.set(res.data),
    });
  }

  protected register(eventId: string): void {
    this.eventRegisterService.register(eventId).subscribe({
      next: (res) => {
        this.refetch(eventId);
        this.commonService.success(res.message);
      },
      error: (err) => {
        if (err instanceof ApiError) this.commonService.error(err);
      },
    });
  }

  protected unregister(eventId: string): void {
    this.confirmService.confirm({
      title: 'Cancel your registration?',
      body: "You'll lose your place and any approval you've been granted.",
      confirmLabel: 'Cancel registration',
      destructive: true,
    }).pipe(
      filter(Boolean),
      switchMap(() => this.eventRegisterService.unregister(eventId)),
    ).subscribe({
      next: (res) => {
        this.refetch(eventId);
        this.commonService.success(res.message);
      },
      error: (err) => {
        if (err instanceof ApiError) this.commonService.error(err);
      },
    });
  }

  protected joinMeeting(eventId: string): void {
    this.dialog.open(AttendeeMeetingDialogComponent, {
      width: 'calc(100% - 10px)',
      maxWidth: '100%',
      height: 'calc(100% - 10px)',
      maxHeight: '100%',
      panelClass: 'meeting-dialog',
      disableClose: true,
      data: { event_id: eventId, event_title: this.displayEvent().title },
    });
  }
}
