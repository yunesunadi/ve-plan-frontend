import { Component, computed, inject, signal, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Subject, catchError, combineLatest, concatMap, map, of, scan, startWith, switchMap, tap } from 'rxjs';
import { Notification } from '../../models/Notification';
import { SocketService } from '../../services/socket.service';
import { NotificationService } from '../../services/notification.service';
import { CommonService } from '../../services/common.service';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { Router } from '@angular/router';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';
import { ApiError } from '../../models/ApiError';

interface NotificationGroup {
  key: string;
  label: string;
  items: Notification[];
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './notifications.component.scss',
  imports: [
    OutletInnerComponent, PageHeaderComponent, InfiniteScrollDirective,
    MatButton, MatIcon, MatCheckbox, MatButtonToggleGroup, MatButtonToggle, AsyncPipe, NgTemplateOutlet,
    SkeletonComponent, EmptyStateComponent, ErrorStateComponent,
  ],
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

  isLoading = signal(true);
  error = signal<ApiError | null>(null);
  total = signal(0);
  unread = signal(0);
  loadedCount = signal(0);
  role = signal('');

  readonly selected = signal<ReadonlySet<string>>(new Set());
  readonly unreadOnly = signal(false);

  readonly skeletonPlaceholders = Array.from({ length: 5 });

  private loadMore$ = new Subject<number>();

  private realtime$ = this.notificationService.markAsRead$.pipe(
    switchMap(() => this.socketService.onNotification().pipe(
      scan((acc, curr) => this.dedupe([curr, ...acc]), [] as Notification[]),
      startWith([] as Notification[]),
    )),
    catchError(() => of([] as Notification[])),
  );

  private pages$ = this.notificationService.markAsRead$.pipe(
    switchMap(() => {
      this.nextOffset = 0;
      return this.loadMore$.pipe(
        startWith(0),
        concatMap((offset) => this.notificationService.getNotifications(offset, this.LIMIT).pipe(
          map((res) => {
            this.total.set(res.meta?.total ?? 0);
            this.unread.set(res.meta?.unread ?? 0);
            this.error.set(null);
            return { offset, items: res.data as Notification[] };
          }),
          catchError((err: unknown) => {
            this.isLoading.set(false);
            if (err instanceof ApiError) this.error.set(err);
            return of({ offset, items: [] as Notification[] });
          }),
        )),
        scan((acc, { offset, items }) => (
          this.dedupe(offset === 0 ? items : [...acc, ...items])
        ), [] as Notification[]),
        tap((list) => {
          this.loadedCount.set(list.length);
          this.isLoading.set(false);
        }),
        startWith([] as Notification[]),
      );
    }),
  );

  private notifications$ = combineLatest([this.pages$, this.realtime$]).pipe(
    map(([existing, realtime]) => this.dedupe([...realtime, ...existing])),
  );

  groups$ = combineLatest([this.notifications$, toObservable(this.unreadOnly)]).pipe(
    map(([list, unreadOnly]): NotificationGroup[] => {
      const filtered = unreadOnly ? list.filter((n) => !n.isRead) : list;
      const groups: NotificationGroup[] = [];

      for (const n of filtered) {
        const { key, label } = this.groupOf(n);
        let group = groups.find((g) => g.key === key);
        if (!group) {
          group = { key, label, items: [] };
          groups.push(group);
        }
        group.items.push(n);
      }

      return groups;
    }),
  );

  readonly selectedCount = computed(() => this.selected().size);

  ngOnInit() {
    this.dashboardCache.has_role.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (res) => this.role.set(res.role),
    });
  }

  private dedupe(list: Notification[]): Notification[] {
    const seen = new Set<string>();
    return list.filter((n) => (seen.has(n._id) ? false : seen.add(n._id)));
  }

  private groupOf(notification: Notification): { key: string; label: string } {
    const created = (notification as { createdAt?: string }).createdAt;
    const when = created ? new Date(created) : new Date();
    const day = new Date(when);
    day.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - day.getTime()) / 86_400_000);
    if (diffDays <= 0) return { key: 'today', label: 'Today' };
    if (diffDays === 1) return { key: 'yesterday', label: 'Yesterday' };

    return {
      key: day.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).format(day),
    };
  }

  senderId(notification: Notification): string | null {
    const sender = notification.sender;
    if (!sender) return null;
    return typeof sender === 'string' ? (sender || null) : (sender._id || null);
  }

  eventLink(notification: Notification): string | null {
    const id = this.senderId(notification);
    return id ? `/${this.role()}/dashboard/events/${id}/view` : null;
  }

  activate(notification: Notification, event?: MouseEvent): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead([notification._id]).subscribe({
        next: () => this.notificationService.markAsRead$.next(null),
      });
    }

    if (event && (event.ctrlKey || event.metaKey || event.shiftKey || event.button === 1)) {
      return;
    }

    event?.preventDefault();
    const link = this.eventLink(notification);
    if (link) this.router.navigateByUrl(link);
  }

  toggleSelection(id: string): void {
    const next = new Set(this.selected());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selected.set(next);
  }

  clearSelection(): void {
    this.selected.set(new Set());
  }

  onScroll(): void {
    if (this.loadedCount() >= this.total()) return;
    this.nextOffset += this.LIMIT;
    this.loadMore$.next(this.nextOffset);
  }

  retry(): void {
    this.error.set(null);
    this.isLoading.set(true);
    this.notificationService.markAsRead$.next(null);
  }

  hasUnread(): boolean {
    return this.unread() > 0;
  }

  markSelectedRead(): void {
    if (this.selected().size === 0) {
      this.commonService.warning('Select at least one notification to mark as read.');
      return;
    }

    this.notificationService.markAsRead([...this.selected()]).subscribe({
      next: () => {
        this.selected.set(new Set());
        this.notificationService.markAsRead$.next(null);
      },
    });
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.selected.set(new Set());
        this.notificationService.markAsRead$.next(null);
      },
    });
  }

  deleteSelected(): void {
    if (this.selected().size === 0) {
      this.commonService.warning('Select at least one notification to delete.');
      return;
    }

    this.notificationService.deleteNotifications([...this.selected()]).subscribe({
      next: () => {
        this.selected.set(new Set());
        this.notificationService.markAsRead$.next(null);
      },
    });
  }
}
