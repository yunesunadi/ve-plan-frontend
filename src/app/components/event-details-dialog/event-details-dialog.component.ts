import {
  Component, DestroyRef, computed, effect, inject, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { environment } from '../../../environments/environment';
import { EventService } from '../../services/event.service';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { UtilService } from '../../services/util.service';
import { ApiError } from '../../models/ApiError';
import { Event as VeEvent, EventCategoryType } from '../../models/Event';
import { StatusChipComponent, StatusKind } from '../../shared/ui/status-chip/status-chip.component';
import { AvatarComponent } from '../../shared/ui/avatar/avatar.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';

const CATEGORY_ICON: Record<EventCategoryType, string> = {
  conference: 'groups',
  meetup: 'group_work',
  webinar: 'cast_for_education',
};

@Component({
  selector: 'app-event-details-dialog',
  templateUrl: './event-details-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './event-details-dialog.component.scss',
  imports: [
    MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose,
    MatButton, MatIcon, StatusChipComponent, AvatarComponent, SkeletonComponent, ErrorStateComponent,
  ],
})
export class EventDetailsDialogComponent {
  private readonly dialogData = inject(MAT_DIALOG_DATA);
  private readonly eventService = inject(EventService);
  private readonly cache = inject(DashboardCacheService);
  private readonly dialogRef = inject(MatDialogRef<this>);
  private readonly router = inject(Router);
  private readonly util = inject(UtilService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly event = signal<VeEvent | null>(null);

  private readonly role = toSignal(
    this.cache.has_role.pipe(map((res) => res.role), catchError(() => of(''))),
    { initialValue: '' },
  );

  private readonly coverFailed = signal(false);

  protected readonly coverSrc = computed<string | null>(() => {
    const cover = this.event()?.cover;
    return cover ? `${environment.coverUrl}/${cover}` : null;
  });

  protected readonly showCover = computed(() => !!this.coverSrc() && !this.coverFailed());

  protected readonly categoryIcon = computed(() => {
    const ev = this.event();
    return ev ? CATEGORY_ICON[ev.category] : 'event';
  });

  protected readonly schedule = computed(() => {
    const ev = this.event();
    return ev ? this.util.formatEventSchedule(ev) : null;
  });

  protected readonly timeStatus = computed<StatusKind>(() => {
    const ev = this.event();
    if (!ev) return 'upcoming';
    return this.util.is_event_expired(ev) ? 'past' : 'upcoming';
  });

  constructor() {
    this.load();

    effect(() => {
      this.coverSrc();
      this.coverFailed.set(false);
    });
  }

  protected retry(): void {
    this.load();
  }

  protected onCoverError(): void {
    this.coverFailed.set(true);
  }

  protected seeDetails(): void {
    const ev = this.event();
    if (!ev) return;
    this.router.navigateByUrl(`${this.role()}/dashboard/events/${ev._id}/view`, { replaceUrl: true });
    this.dialogRef.close();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.eventService.getOneById(this.dialogData.id).pipe(
      map((res) => res.data),
      catchError((err: ApiError) => {
        this.error.set(err);
        this.loading.set(false);
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((data) => {
      if (data) {
        this.event.set(data);
        this.loading.set(false);
      }
    });
  }
}
