import { Component, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, catchError, combineLatest, concatMap, map, of, scan, startWith, switchMap, tap } from 'rxjs';
import { Notification } from '../../models/Notification';
import { SocketService } from '../../services/socket.service';
import { NotificationService } from '../../services/notification.service';
import { CommonService } from '../../services/common.service';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { Router, RouterLink } from '@angular/router';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent } from '@angular/material/card';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';
import { ApiError } from '../../models/ApiError';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './notifications.component.scss',
    imports: [OutletInnerComponent, PageHeaderComponent, MatButton, MatIcon, MatCard, NgClass, MatCardContent, MatCheckbox, AsyncPipe, RouterLink, SkeletonComponent, EmptyStateComponent, ErrorStateComponent]
})
export class NotificationsComponent {
  private notificationService = inject(NotificationService);
  private socketService = inject(SocketService);
  private commonService = inject(CommonService);
  private dashboardCache = inject(DashboardCacheService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private readonly LIMIT = 20;
  private nextOffset = 0;

  selection = new SelectionModel<string>(true, []);

  isLoading = signal(true);
  error = signal<ApiError | null>(null);
  total = signal(0);
  unread = signal(0);
  loadedCount = signal(0);
  role = signal('');

  readonly skeletonPlaceholders = Array.from({ length: 5 });

  private loadMore$ = new Subject<number>();

  private realtime$ = this.notificationService.markAsRead$.pipe(
    switchMap(() => this.socketService.onNotification().pipe(
      scan((acc, curr) => this.dedupe([curr, ...acc]), [] as Notification[]),
      startWith([] as Notification[])
    )),
    catchError(() => of([] as Notification[]))
  );

  private pages$ = this.notificationService.markAsRead$.pipe(
    switchMap(() => {
      this.nextOffset = 0;
      return this.loadMore$.pipe(
        startWith(0),
        concatMap(offset =>
          this.notificationService.getNotifications(offset, this.LIMIT).pipe(
            map(res => {
              this.total.set(res.meta?.total ?? 0);
              this.unread.set(res.meta?.unread ?? 0);
              this.error.set(null);
              return { offset, items: res.data as Notification[] };
            }),
            catchError((err: unknown) => {
              this.isLoading.set(false);
              if (err instanceof ApiError) this.error.set(err);
              return of({ offset, items: [] as Notification[] });
            })
          )
        ),
        scan((acc, { offset, items }) => (
          this.dedupe(offset === 0 ? items : [...acc, ...items])
        ), [] as Notification[]),
        tap(list => {
          this.loadedCount.set(list.length);
          this.isLoading.set(false);
        }),
        startWith([] as Notification[])
      );
    })
  );

  notifications$ = combineLatest([this.pages$, this.realtime$]).pipe(
    map(([existing, realtime]) => this.dedupe([...realtime, ...existing]))
  );

  constructor() {}

  ngOnInit() {
    this.dashboardCache.has_role.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (res) => this.role.set(res.role)
    });
  }

  private dedupe(list: Notification[]): Notification[] {
    const seen = new Set<string>();
    return list.filter(n => (seen.has(n._id) ? false : seen.add(n._id)));
  }

  loadMore() {
    this.nextOffset += this.LIMIT;
    this.loadMore$.next(this.nextOffset);
  }

  retry() {
    this.error.set(null);
    this.isLoading.set(true);
    this.notificationService.markAsRead$.next(null);
  }

  hasUnread(list: Notification[] | null): boolean {
    return this.unread() > 0 || !!list?.some(n => !n.isRead);
  }

  senderId(notification: Notification): string | null {
    const sender = notification.sender;
    if (!sender) return null;
    return typeof sender === 'string' ? (sender || null) : (sender._id || null);
  }

  navigateToSender(notification: Notification) {
    const id = this.senderId(notification);
    if (id) {
      this.router.navigateByUrl(`/${this.role()}/dashboard/events/${id}/view`);
    }
  }

  markAsRead() {
    if (this.selection.isEmpty()) {
      this.commonService.warning('Please select at least one notification to mark as read');
      return;
    }

    this.notificationService.markAsRead(this.selection.selected).subscribe({
      next: () => {
        this.selection.clear();
        this.notificationService.markAsRead$.next(null);
      }
    });
  }

  markAllRead() {
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.selection.clear();
        this.notificationService.markAsRead$.next(null);
      }
    });
  }

  deleteSelected() {
    if (this.selection.isEmpty()) {
      this.commonService.warning('Please select at least one notification to delete');
      return;
    }

    this.notificationService.deleteNotifications(this.selection.selected).subscribe({
      next: () => {
        this.selection.clear();
        this.notificationService.markAsRead$.next(null);
      }
    });
  }
}
