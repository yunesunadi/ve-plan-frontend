import { Component, inject, DestroyRef, ChangeDetectionStrategy, computed } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { catchError, of, map, startWith, switchMap, scan, filter, shareReplay } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { ConfirmService } from '../../services/confirm.service';
import { LayoutService } from '../../services/layout.service';
import { ThemeService, ThemePreference } from '../../services/theme.service';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDrawerContainer, MatDrawer, MatDrawerContent } from '@angular/material/sidenav';
import { AsyncPipe } from '@angular/common';
import { AvatarComponent } from '../../shared/ui/avatar/avatar.component';
import { BrandLogoComponent } from '../../shared/ui/brand-logo/brand-logo.component';
import { AppNavComponent } from './app-nav/app-nav.component';
import { BottomNavComponent } from './bottom-nav/bottom-nav.component';
import { NAV_DESTINATIONS, NavDestination } from './nav-destinations';
import { RoleType } from '../../models/User';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-private',
    templateUrl: './private.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './private.component.scss',
    imports: [
      MatToolbar, MatIconButton, MatButton, MatIcon, RouterLink, MatBadge, MatTooltip, MatMenuTrigger,
      MatMenu, MatMenuItem, MatDrawerContainer, MatDrawer, MatDrawerContent, RouterOutlet, AsyncPipe,
      AvatarComponent, BrandLogoComponent, AppNavComponent, BottomNavComponent,
    ]
})
export class PrivateComponent {
  private route = inject(Router);
  private notificationService = inject(NotificationService);
  private socketService = inject(SocketService);
  private dashboardCache = inject(DashboardCacheService);
  private authService = inject(AuthService);
  private confirmService = inject(ConfirmService);
  private destroyRef = inject(DestroyRef);
  protected readonly layout = inject(LayoutService);
  protected readonly theme = inject(ThemeService);

  protected readonly themeOptions: { value: ThemePreference; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: 'light_mode' },
    { value: 'dark', label: 'Dark', icon: 'dark_mode' },
    { value: 'system', label: 'System', icon: 'contrast' },
  ];

  current_user$ = this.dashboardCache.current_user.pipe(
    catchError(() => of(null))
  );

  private readonly currentUser = toSignal(this.current_user$, { initialValue: null });

  protected readonly destinations = computed<NavDestination[]>(() => {
    const role = this.authService.role() ?? (this.currentUser()?.role as RoleType | undefined);
    return role ? NAV_DESTINATIONS[role] : [];
  });

  protected readonly isRail = computed(() => this.layout.mode() === 'medium');

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
    this.confirmService.confirm({
      title: "Log out?",
      body: "You'll need to sign in again to access your dashboard.",
      confirmLabel: "Log out",
    }).pipe(
      filter(Boolean)
    ).subscribe(() => {
      this.socketService.disconnect();
      localStorage.removeItem("token");
      this.route.navigateByUrl("login");
    });
  }
}
