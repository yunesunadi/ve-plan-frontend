import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EventsComponent } from '../pages/events/events.component';
import { EventViewComponent } from './event-view/event-view.component';
import { InvitationsComponent } from './invitations/invitations.component';
import { JoinedEventsComponent } from './joined-events/joined-events.component';
import { SettingComponent } from '../pages/setting/setting.component';
import { NotFoundComponent } from '../pages/not-found/not-found.component';
import { NotificationsComponent } from '../pages/notifications/notifications.component';
import { eventResolver } from '../resolvers/event.resolver';
import { Event } from '../models/Event';

export const MOD_ATTENDEE_ROUTES: Routes = [
  {
    path: "home",
    component: HomeComponent,
  },
  {
    path: "events",
    component: EventsComponent,
  },
  {
    path: "events/:id/view",
    component: EventViewComponent,
    resolve: { event: eventResolver },
    data: {
      breadcrumb: [
        { label: 'Events', link: '/attendee/dashboard/events' },
        { label: (data: Record<string, unknown>) => (data['event'] as Event).title },
      ],
    },
  },
  {
    path: "invitations",
    component: InvitationsComponent,
  },
  {
    path: "joined_events",
    component: JoinedEventsComponent,
  },
  {
    path: "setting",
    component: SettingComponent,
  },
  {
    path: "notifications",
    component: NotificationsComponent,
  },
  {
    path: "**",
    component: NotFoundComponent,
  },
];
