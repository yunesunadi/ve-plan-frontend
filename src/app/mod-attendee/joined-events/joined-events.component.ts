import { Component, inject, signal, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { EventRegisterService } from '../../services/event-register.service';
import { EventInviteService } from '../../services/event-invite.service';
import { BehaviorSubject, catchError, combineLatest, concatMap, map, Observable, of, scan, shareReplay, switchMap, tap } from 'rxjs';
import { NgClass, AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { PageQuery, Timestamp } from '../../models/Utils';
import { EventRegister } from '../../models/EventRegister';
import { EventInvite } from '../../models/EventInvite';
import { ApiError } from '../../models/ApiError';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { EventCardComponent } from '../../shared/ui/event-card/event-card.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';
import { StatusKind } from '../../shared/ui/status-chip/status-chip.component';

interface Query {
  category?: string;
}

type JoinedRow = Timestamp & (EventRegister | EventInvite);
type PagedResponse = { data: JoinedRow[]; meta?: { total: number } };

@Component({
    selector: 'app-joined-events',
    templateUrl: './joined-events.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './joined-events.component.scss',
    imports: [OutletInnerComponent, PageHeaderComponent, MatButton, MatIcon, MatBadge, MatMenuTrigger, MatMenu, MatMenuItem, NgClass, RouterLink, AsyncPipe, EventCardComponent, SkeletonComponent, EmptyStateComponent, ErrorStateComponent]
})
export class JoinedEventsComponent {
  private eventRegisterService = inject(EventRegisterService);
  private eventInviteService = inject(EventInviteService);
  private activatedRoute = inject(ActivatedRoute);
  private dashboardCache = inject(DashboardCacheService);
  private router = inject(Router);
  role = signal("");
  label = signal("");
  isLoading = signal(true);
  error = signal<ApiError | null>(null);

  readonly LOAD_LIMIT = 20;
  readonly skeletonPlaceholders = Array.from({ length: this.LOAD_LIMIT });

  private registeredOffset$ = new BehaviorSubject<number>(0);
  private approvedOffset$ = new BehaviorSubject<number>(0);
  private acceptedOffset$ = new BehaviorSubject<number>(0);

  registeredLen = signal(0);
  approvedLen = signal(0);
  acceptedLen = signal(0);
  registeredTotal = signal(0);
  approvedTotal = signal(0);
  acceptedTotal = signal(0);

  constructor() {}

  ngOnInit() {
    this.dashboardCache.has_role.subscribe({
      next: (res) => {
        this.role.set(res.role);
      }
    });
  }

  private paged(
    fetch: (q: Partial<PageQuery>) => Observable<PagedResponse>,
    offset$: BehaviorSubject<number>,
    totalSig: WritableSignal<number>,
    lenSig: WritableSignal<number>
  ): Observable<JoinedRow[]> {
    return offset$.pipe(
      concatMap((offset) => fetch({ offset, limit: this.LOAD_LIMIT }).pipe(
        tap((res) => {
          totalSig.set(res.meta?.total ?? 0);
          this.error.set(null);
        }),
        map((res) => ({ data: res.data, offset })),
        catchError((err: unknown) => {
          this.isLoading.set(false);
          if (err instanceof ApiError) this.error.set(err);
          return of({ data: [] as JoinedRow[], offset });
        })
      )),
      scan((acc: JoinedRow[], { data, offset }) => (offset === 0 ? [...data] : [...acc, ...data]), []),
      tap((rows) => lenSig.set(rows.length)),
      shareReplay(1)
    );
  }

  registered_events$ = this.paged(
    (q) => this.eventRegisterService.getAllByUserId(q),
    this.registeredOffset$, this.registeredTotal, this.registeredLen
  );

  register_approved_events$ = this.paged(
    (q) => this.eventRegisterService.getAllApprovedByUserId(q),
    this.approvedOffset$, this.approvedTotal, this.approvedLen
  );

  invitation_accepted_events$ = this.paged(
    (q) => this.eventInviteService.getAllAcceptedByUserId(q),
    this.acceptedOffset$, this.acceptedTotal, this.acceptedLen
  );

  query$ = this.activatedRoute.queryParams.pipe(
    switchMap((query) => {
      let qry: Query;

      if (Object.keys(query).length > 0) {
        qry = Object.fromEntries(new URLSearchParams(query));
      } else {
        qry = {
          category: "all"
        };
      }

      return of(qry);
    }),
    shareReplay(1)
  );

  joined_events$ = this.query$.pipe(
    switchMap((query) => {
      let result$: Observable<JoinedRow[]>;

      switch (query.category) {
        case "registered":
          result$ = this.registered_events$;
          this.label.set("Registered");
          break;
        case "register_approved":
          result$ = this.register_approved_events$;
          this.label.set("Register Approved");
          break;
        case "invitation_accepted":
          result$ = this.invitation_accepted_events$;
          this.label.set("Invitation Accepted");
          break;
        default:
          result$ = combineLatest([
            this.registered_events$,
            this.register_approved_events$,
            this.invitation_accepted_events$
          ]).pipe(
            map(([registered, approved, accepted]) => ([...registered, ...approved, ...accepted]))
          );
          this.label.set("Joined");
      }

      return result$.pipe(tap(() => this.isLoading.set(false)));
    })
  );

  hasMore(category?: string): boolean {
    switch (category) {
      case "registered":
        return this.registeredLen() < this.registeredTotal();
      case "register_approved":
        return this.approvedLen() < this.approvedTotal();
      case "invitation_accepted":
        return this.acceptedLen() < this.acceptedTotal();
      default:
        return this.registeredLen() < this.registeredTotal()
          || this.approvedLen() < this.approvedTotal()
          || this.acceptedLen() < this.acceptedTotal();
    }
  }

  loadMore(category?: string) {
    const advance = (
      len: () => number, total: () => number, offset$: BehaviorSubject<number>
    ) => {
      if (len() < total()) offset$.next(len());
    };

    switch (category) {
      case "registered":
        advance(this.registeredLen, this.registeredTotal, this.registeredOffset$);
        break;
      case "register_approved":
        advance(this.approvedLen, this.approvedTotal, this.approvedOffset$);
        break;
      case "invitation_accepted":
        advance(this.acceptedLen, this.acceptedTotal, this.acceptedOffset$);
        break;
      default:
        advance(this.registeredLen, this.registeredTotal, this.registeredOffset$);
        advance(this.approvedLen, this.approvedTotal, this.approvedOffset$);
        advance(this.acceptedLen, this.acceptedTotal, this.acceptedOffset$);
    }
  }

  activeFilterCount(query: Query | null): number {
    return query?.category && query.category !== 'all' ? 1 : 0;
  }

  changeFilter(category: string) {
    this.router.navigate([`/${this.role()}/dashboard/joined_events`], {
      queryParams: { category },
      replaceUrl: true
    });
  }

  retry(query: Query | null) {
    this.error.set(null);
    this.isLoading.set(true);

    const advance = (offset$: BehaviorSubject<number>) => offset$.next(offset$.value);

    switch (query?.category) {
      case "registered":
        advance(this.registeredOffset$);
        break;
      case "register_approved":
        advance(this.approvedOffset$);
        break;
      case "invitation_accepted":
        advance(this.acceptedOffset$);
        break;
      default:
        advance(this.registeredOffset$);
        advance(this.approvedOffset$);
        advance(this.acceptedOffset$);
    }
  }

  rowStatus(row: JoinedRow): StatusKind {
    if ('invitation_accepted' in row) return 'invitation_accepted';
    return row.register_approved ? 'register_approved' : 'registered';
  }
}
