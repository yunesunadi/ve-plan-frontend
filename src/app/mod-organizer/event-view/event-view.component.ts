import { Component, computed, effect, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { jwtDecode } from 'jwt-decode';
import { EventService } from '../../services/event.service';
import { CommonService } from '../../services/common.service';
import { ConfirmService } from '../../services/confirm.service';
import { EventDialogComponent } from '../../components/event-dialog/event-dialog.component';
import { UserPayload } from '../../models/User';
import { Event } from '../../models/Event';
import { ApiError } from '../../models/ApiError';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { EventViewStore } from '../../shared/event-view/event-view-store';

@Component({
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './event-view.component.scss',
  providers: [EventViewStore],
  imports: [
    OutletInnerComponent, PageHeaderComponent, MatButton, MatIcon,
    RouterLink, RouterLinkActive, RouterOutlet,
  ],
})
export class EventViewComponent {
  private eventService = inject(EventService);
  private commonService = inject(CommonService);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  protected store = inject(EventViewStore);

  event = input.required<Event>();

  private eventOverride = signal<Event | null>(null);
  protected displayEvent = computed(() => this.eventOverride() ?? this.event());

  constructor() {
    effect(() => {
      this.event();
      this.eventOverride.set(null);
    });

    effect(() => {
      const event = this.displayEvent();
      this.store.setEvent(event);
      this.store.setCanManage(this.isOwner(event.user._id));
    });
  }

  protected isOwner(userId: string): boolean {
    const token = localStorage.getItem('token') || '';
    return (jwtDecode(token) as UserPayload)._id === userId;
  }

  protected editEvent(event: Event): void {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      data: {
        ...event,
        start_time: new Date(event.start_time).toISOString(),
        end_time: new Date(event.end_time).toISOString(),
      },
      disableClose: true,
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.eventService.getOneById(event._id).subscribe({
        next: (res) => this.eventOverride.set(res.data),
      });
    });
  }

  protected deleteEvent(eventId: string, eventTitle: string): void {
    this.confirmService.confirm({
      title: 'Delete this event?',
      body: 'Once you delete this, all data related with this event will be removed. This action cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
      confirmationPhrase: eventTitle,
      confirmationHint: 'Type the event title to confirm',
    }).pipe(
      filter(Boolean),
      switchMap(() => this.eventService.delete(eventId)),
    ).subscribe({
      next: (res) => {
        this.commonService.success(res.message);
        this.router.navigateByUrl('organizer/dashboard/my_events');
      },
      error: (err) => {
        if (err instanceof ApiError) this.commonService.error(err);
      },
    });
  }
}
