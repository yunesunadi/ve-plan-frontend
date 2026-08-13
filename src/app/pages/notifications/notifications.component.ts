import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { catchError, combineLatest, map, of, scan, startWith, switchMap, tap } from 'rxjs';
import { Notification } from '../../models/Notification';
import { SocketService } from '../../services/socket.service';
import { NotificationService } from '../../services/notification.service';
import { CommonService } from '../../services/common.service';
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
    imports: [PageLoadingComponent, OutletInnerComponent, MatButton, MatIcon, MatCard, NgClass, MatCardContent, MatCheckbox, AsyncPipe]
})
export class NotificationsComponent {
  private notificationService = inject(NotificationService);
  private socketService = inject(SocketService);
  private commonService = inject(CommonService);

  readNotifications = signal<string[]>([]);
  isLoading = signal(true);

  realtime_notifications$ = this.socketService.onNotification().pipe(
    scan((acc, curr) => [curr, ...acc], [] as Notification[]),
    startWith([] as Notification[]),
    catchError(() => of([] as Notification[]))
  );

  notifications_data$ = this.notificationService.getNotifications().pipe(
    tap(() => this.isLoading.set(false)),
    map(res => res.data),
    startWith([] as Notification[]),
    catchError(() => of([] as Notification[]))
  );

  notifications$ = this.notificationService.markAsRead$.pipe(
    switchMap(() => combineLatest([
      this.notifications_data$,
      this.realtime_notifications$
    ]).pipe(
      map(([existing, realtime]) => ([...realtime, ...existing])),
    ))
  );

  ngOnInit() {
    const token = localStorage.getItem("token");
    if (!token) return;
    this.socketService.connect(token);
  }

  constructor() {}

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
