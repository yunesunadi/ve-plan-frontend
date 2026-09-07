import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { CalendarComponent } from '../pages/calendar/calendar.component';
import { EventsComponent } from '../pages/events/events.component';
import { EventViewComponent } from './event-view/event-view.component';
import { EventTabComponent } from './event-view/event-tab.component';
import { MyEventsComponent } from './my-events/my-events.component';
import { SettingComponent } from '../pages/setting/setting.component';
import { NotFoundComponent } from '../pages/not-found/not-found.component';
import { NotificationsComponent } from '../pages/notifications/notifications.component';
import { eventResolver } from '../resolvers/event.resolver';
import { Event } from '../models/Event';

export const MOD_ATTENDEE_ROUTES: Routes = [
  {
    path: "home",
    component: HomeComponent,
    data: { breadcrumb: ['Home'] },
  },
  {
    path: "calendar",
    component: CalendarComponent,
    data: { breadcrumb: ['Calendar'] },
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
    children: [
      { path: "", pathMatch: "full", redirectTo: "overview" },
      {
        path: "overview",
        component: EventTabComponent,
        data: {
          tab: "overview",
          breadcrumb: [
            { label: 'Events', link: '/attendee/dashboard/events' },
            {
              label: (data: Record<string, unknown>) => (data['event'] as Event).title,
              link: (data: Record<string, unknown>) => ['/attendee/dashboard/events', (data['event'] as Event)._id, 'view'],
            },
            'Overview',
          ],
        },
      },
      {
        path: "agenda",
        component: EventTabComponent,
        data: {
          tab: "agenda",
          breadcrumb: [
            { label: 'Events', link: '/attendee/dashboard/events' },
            {
              label: (data: Record<string, unknown>) => (data['event'] as Event).title,
              link: (data: Record<string, unknown>) => ['/attendee/dashboard/events', (data['event'] as Event)._id, 'view'],
            },
            'Agenda',
          ],
        },
      },
    ],
  },
  {
    path: "my_events",
    component: MyEventsComponent,
    data: { breadcrumb: ['My Events'] },
  },
  {
    path: "invitations",
    redirectTo: () => inject(Router).parseUrl('/attendee/dashboard/my_events?filter=invited'),
  },
  {
    path: "joined_events",
    redirectTo: () => inject(Router).parseUrl('/attendee/dashboard/my_events?filter=registered'),
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
