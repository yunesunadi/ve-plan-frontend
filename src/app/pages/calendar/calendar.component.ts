import {
  ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, map, of, switchMap } from 'rxjs';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EventDialogComponent } from '../../components/event-dialog/event-dialog.component';
import { EventDetailsDialogComponent } from '../../components/event-details-dialog/event-details-dialog.component';
import { EventService } from '../../services/event.service';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { LayoutService } from '../../services/layout.service';
import { ApiError } from '../../models/ApiError';
import { Event as VeEvent } from '../../models/Event';

type CalendarView = 'dayGridMonth' | 'listMonth';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './calendar.component.scss',
  imports: [
    FullCalendarModule, MatButtonToggleGroup, MatButtonToggle, MatIcon,
    OutletInnerComponent, PageHeaderComponent, ErrorStateComponent, SkeletonComponent,
  ],
})
export class CalendarComponent {
  private eventService = inject(EventService);
  private dashboardCache = inject(DashboardCacheService);
  private dialog = inject(MatDialog);
  protected readonly layout = inject(LayoutService);

  private readonly calendarRef = viewChild(FullCalendarComponent);

  protected readonly loading = signal(true);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly events = signal<VeEvent[]>([]);

  private readonly role = toSignal(
    this.dashboardCache.has_role.pipe(map((r) => r.role), catchError(() => of(''))),
    { initialValue: '' },
  );
  protected readonly canCreate = computed(() => this.role() === 'organizer');

  protected readonly subtitle = computed(() => {
    if (this.canCreate()) {
      return this.view() === 'dayGridMonth'
        ? 'Click a day to create an event.'
        : 'Every event on VE-Plan, at a glance.';
    }
    return 'Every public event on VE-Plan, at a glance.';
  });

  private readonly userView = signal<CalendarView>('dayGridMonth');
  protected readonly view = computed<CalendarView>(() =>
    this.layout.isCompact() ? 'listMonth' : this.userView(),
  );

  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  private readonly mappedEvents = computed<EventInput[]>(() =>
    this.events().map((event) => ({
      id: event._id,
      title: event.title,
      start: event.starts_at ?? event.date,
      end: event.ends_at ?? undefined,
      allDay: !event.starts_at,
      display: 'block',
      classNames: [event.type === 'private' ? 'fc-event--private' : 'fc-event--public'],
    })),
  );

  protected readonly calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin, listPlugin, interactionPlugin],
    initialView: this.view(),
    headerToolbar: this.layout.isCompact()
      ? { left: 'title', center: '', right: 'prev,next today' }
      : { left: 'prev,next', center: 'title', right: 'today' },
    events: this.mappedEvents(),
    weekends: true,
    dayMaxEvents: true,
    height: 'auto',
    noEventsText: 'No events this month',
    eventClick: (arg: EventClickArg) => this.openDetails(arg),
    dateClick: this.canCreate() ? (arg: DateClickArg) => this.openCreate(arg) : undefined,
  }));

  constructor() {
    this.refresh$.pipe(
      switchMap(() => {
        this.loading.set(true);
        this.error.set(null);
        return this.eventService.getAll().pipe(
          map((res) => res.data),
          catchError((err: ApiError) => {
            this.error.set(err);
            this.loading.set(false);
            return of(null);
          }),
        );
      }),
      takeUntilDestroyed(),
    ).subscribe((data) => {
      if (data) {
        this.events.set(data);
        this.loading.set(false);
      }
    });

    effect(() => {
      const api = this.calendarRef()?.getApi();
      const target = this.view();
      if (api && api.view.type !== target) {
        api.changeView(target);
      }
    });
  }

  setView(next: CalendarView) {
    this.userView.set(next);
  }

  retry() {
    this.refresh$.next();
  }

  private openDetails(arg: EventClickArg) {
    this.dialog.open(EventDetailsDialogComponent, {
      data: { id: arg.event.id },
      autoFocus: false,
      width: '500px',
    });
  }

  private openCreate(arg: DateClickArg) {
    this.dialog.open(EventDialogComponent, {
      data: { date: arg.date },
      disableClose: true,
      width: '500px',
    }).afterClosed().subscribe(() => this.refresh$.next());
  }
}
