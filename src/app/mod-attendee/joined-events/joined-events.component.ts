import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { EventRegisterService } from '../../services/event-register.service';
import { EventInviteService } from '../../services/event-invite.service';
import { combineLatest, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { Location, NgClass, AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DashboardCacheService } from '../../caches/dashboard-cache.service';
import { Timestamp } from '../../models/Utils';
import { EventRegister } from '../../models/EventRegister';
import { EventInvite } from '../../models/EventInvite';
import { PageLoadingComponent } from '../../shared/page-loading/page-loading.component';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatCard, MatCardTitle, MatCardSubtitle, MatCardActions } from '@angular/material/card';

interface Query { 
  category?: string; 
}

@Component({
    selector: 'app-joined-events',
    templateUrl: './joined-events.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './joined-events.component.scss',
    imports: [PageLoadingComponent, OutletInnerComponent, MatButton, MatIcon, MatBadge, MatMenuTrigger, MatMenu, MatMenuItem, NgClass, MatCard, MatCardTitle, MatCardSubtitle, MatCardActions, RouterLink, AsyncPipe]
})
export class JoinedEventsComponent {
  private eventRegisterService = inject(EventRegisterService);
  private eventInviteService = inject(EventInviteService);
  private activatedRoute = inject(ActivatedRoute);
  private dashboardCache = inject(DashboardCacheService);
  private router = inject(Router);
  location = inject(Location);
  role = signal("");
  label = signal("");
  isLoading = signal(true);

  constructor() {}

  ngOnInit() {
    this.dashboardCache.has_role.subscribe({
      next: (res) => {
        this.role.set(res.role);
      }
    });
  }

  query$ = this.activatedRoute.queryParams.pipe(
    switchMap((query) => {
      let qry = <Query>{};

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

  registered_events$ = this.eventRegisterService.getAllByUserId().pipe(
    map((res) => res.data),
    shareReplay(1)
  );

  register_approved_events$ = this.eventRegisterService.getAllApprovedByUserId().pipe(
    map((res) => res.data),
    shareReplay(1)
  );

  invitation_accepted_events$ = this.eventInviteService.getAllAcceptedByUserId().pipe(
    map((res) => res.data),
    shareReplay(1)
  );

  joined_events$ = this.query$.pipe(
    switchMap((query) => {
      let result$ = null;

      switch (query.category) {
        case "all": {
          result$ = combineLatest([
            this.registered_events$,
            this.register_approved_events$,
            this.invitation_accepted_events$
          ]).pipe(
            tap(() => this.isLoading.set(false)),
            map(([registered, approved, accepted]) => ([...registered, ...approved, ...accepted]))
          );
          this.label.set("Joined");
        }
        break;
        case "registered": {
          result$ = this.registered_events$;
          this.label.set("Registered");
        }
        break;
        case "register_approved": {
          result$ = this.register_approved_events$;
          this.label.set("Register Approved");
        }
        break;
        case "invitation_accepted": {
          result$ = this.invitation_accepted_events$;
          this.label.set("Invitation Accepted");
        }
        break;
      }
      return result$ as unknown as Observable<Array<Timestamp & (EventRegister | EventInvite)>>;
    })
  );

  changeFilter(category: string) {
    this.router.navigate([`/${this.role()}/dashboard/joined_events`], {
      queryParams: { category },
      replaceUrl: true
    });
  }
}
