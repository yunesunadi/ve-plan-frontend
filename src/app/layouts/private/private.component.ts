import { Component, inject, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { environment } from '../../../environments/environment';
import { catchError, of, map, startWith, switchMap, scan, filter, shareReplay } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { User } from '../../models/User';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { MatDrawerContainer, MatDrawer } from '@angular/material/sidenav';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-private',
    templateUrl: './private.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './private.component.scss',
    imports: [MatToolbar, MatIconButton, MatIcon, RouterLink, MatBadge, MatTooltip, MatMenuTrigger, MatMenu, MatMenuItem, MatDivider, MatDrawerContainer, MatDrawer, RouterLinkActive, RouterOutlet, AsyncPipe]
})
export class PrivateComponent {
  private route = inject(Router);
  private notificationService = inject(NotificationService);
  private socketService = inject(SocketService);
  private dashboardCache = inject(DashboardCacheService);
  private destroyRef = inject(DestroyRef);

  current_user$ = this.dashboardCache.current_user.pipe(
    catchError(() => of(null))
  );

  socketConnected$ = this.socketService.connected$();

  notifications_count$ = this.notificationService.markAsRead$.pipe(
    switchMap(() => this.notificationService.getNotificationsCount().pipe(
      map(res => res.unreadCount),
      catchError(() => of(0)),
      switchMap(base => this.socketService.onNotification().pipe(
        scan(acc => acc + 1, base),
        startWith(base)
      ))
    )),
    startWith(0),
    shareReplay(1)
  );

  ngOnInit() {
    const token = localStorage.getItem("token");
    if (!token) return;

    this.socketService.connect(token);

    this.socketService.connected$().pipe(
      filter(Boolean),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.notificationService.markAsRead$.next(null));
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }

  logout() {
    const isConfirmed = confirm("Are you sure to logout?");

    if (isConfirmed) {
      this.socketService.disconnect();
      localStorage.removeItem("token");
      this.route.navigateByUrl("login");
    }
  }

  profileUrl(user: User | null) {
    if (user?.profile) {
      if (user.googleId || user.facebookId) {
        return user.profile;
      }
      return environment.profileUrl + "/" + user.profile;
    }

    return "assets/images/placeholder_person.png";
  }
}
