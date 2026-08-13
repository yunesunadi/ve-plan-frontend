import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserPayload } from '../../models/User';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { catchError, of, map, combineLatest, startWith, switchMap, timer, scan } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { Notification } from '../../models/Notification';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { MatDrawerContainer, MatDrawer } from '@angular/material/sidenav';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-private',
    templateUrl: './private.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './private.component.scss',
    imports: [MatToolbar, MatIconButton, MatIcon, RouterLink, MatBadge, MatMenuTrigger, MatMenu, MatMenuItem, MatDivider, MatDrawerContainer, MatDrawer, RouterLinkActive, RouterOutlet, AsyncPipe]
})
export class PrivateComponent {
  private route = inject(Router);
  private notificationService = inject(NotificationService);
  private socketService = inject(SocketService);

  notifications_data_count$ = this.notificationService.getNotificationsCount().pipe(
    map(res => res.unreadCount),
    startWith(0),
    catchError(() => of(0))
  );

  realtime_notifications_count$ = this.socketService.onNotification().pipe(
    scan((acc, curr) => [curr, ...acc], [] as Notification[]),
    map(notifications => notifications.length),
    startWith(0),
    catchError(() => of(0))
  );

  notifications_count$ = this.notificationService.markAsRead$.pipe(
    switchMap(() => combineLatest([
      this.notifications_data_count$,
      this.realtime_notifications_count$
    ]).pipe(
      map(([existing, realtime]) => existing + realtime)
    ))
  );

  ngOnInit() {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    if (!this.socketService.isConnected()) {
      console.log('Attempting to connect socket...');
      this.socketService.connect(token);
    }
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }

  logout() {
    const isConfirmed = confirm("Are you sure to logout?");

    if (isConfirmed) {
      localStorage.removeItem("token");
      this.route.navigateByUrl("login");
    }
  }

  get isAttendee() {
    const token = localStorage.getItem("token") || "";
    const decoded: UserPayload = jwtDecode(token);
    return decoded.role === "attendee";
  }

  get isOrganizer() {
    const token = localStorage.getItem("token") || "";
    const decoded: UserPayload = jwtDecode(token);
    return decoded.role === "organizer";
  }

  get profile_url() {
    const token = localStorage.getItem("token") || "";
    const decoded: UserPayload = jwtDecode(token);
    if (decoded.profile) {
      if (decoded.googleId || decoded.facebookId) {
        return decoded.profile;
      } else {
        return environment.profileUrl + "/" + decoded.profile;
      }
    }

    return "assets/images/placeholder_person.png";
  }
}
