import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Subject, catchError, combineLatest, concatMap, map, of, scan, startWith, switchMap, tap } from 'rxjs';
import { Notification } from '../../models/Notification';
import { SocketService } from '../../services/socket.service';
import { NotificationService } from '../../services/notification.service';
import { CommonService } from '../../services/common.service';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { Router, RouterLink } from '@angular/router';
import { PageLoadingComponent } from '../../shared/page-loading/page-loading.component';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent } from '@angular/material/card';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './notifications.component.scss',
    imports: [PageLoadingComponent, OutletInnerComponent, MatButton, MatIcon, MatCard, NgClass, MatCardContent, MatCheckbox, AsyncPipe, RouterLink]
})
export class NotificationsComponent {
  private notificationService = inject(NotificationService);
  private socketService = inject(SocketService);
  private commonService = inject(CommonService);
  private dashboardCache = inject(DashboardCacheService);
  private router = inject(Router);

  private readonly LIMIT = 20;
  private nextOffset = 0;

  readNotifications = signal<string[]>([]);
  isLoading = signal(true);
  total = signal(0);
  unread = signal(0);
  loadedCount = signal(0);
  role = signal('');

  private loadMore$ = new Subject<number>();

  realtime_notifications$ = this.socketService.onNotification().pipe(
    scan((acc, curr) => [curr, ...acc], [] as Notification[]),
    startWith([] as Notification[]),
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
              return { offset, items: res.data as Notification[] };
            }),
            catchError(() => of({ offset, items: [] as Notification[] }))
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

  notifications$ = combineLatest([this.pages$, this.realtime_notifications$]).pipe(
    map(([existing, realtime]) => this.dedupe([...realtime, ...existing]))
  );

  constructor() {}

  ngOnInit() {
    this.dashboardCache.has_role.subscribe({
      next: (res) => this.role.set(res.role)
    });

    const token = localStorage.getItem("token");
    if (!token) return;
    this.socketService.connect(token);
  }

  private dedupe(list: Notification[]): Notification[] {
    const seen = new Set<string>();
    return list.filter(n => (seen.has(n._id) ? false : seen.add(n._id)));
  }

  loadMore() {
    this.nextOffset += this.LIMIT;
    this.loadMore$.next(this.nextOffset);
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
    if (this.readNotifications().length === 0) {
      this.commonService.openSnackBar('Please select at least one notification to mark as read');
      return;
    }

    this.notificationService.markAsRead(this.readNotifications()).subscribe({
      next: () => {
        this.readNotifications.set([]);
        this.notificationService.markAsRead$.next(null);
      }
    });
  }

  markAllRead() {
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.readNotifications.set([]);
        this.notificationService.markAsRead$.next(null);
      }
    });
  }

  deleteSelected() {
    if (this.readNotifications().length === 0) {
      this.commonService.openSnackBar('Please select at least one notification to delete');
      return;
    }

    this.notificationService.deleteNotifications(this.readNotifications()).subscribe({
      next: () => {
        this.readNotifications.set([]);
        this.notificationService.markAsRead$.next(null);
      }
    });
  }

  onChange(notificationId: string) {
    this.readNotifications.update(prev => [...prev, notificationId]);
  }
}
