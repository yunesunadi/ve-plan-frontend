import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EventsComponent } from '../pages/events/events.component';
import { EventViewComponent } from './event-view/event-view.component';
import { RegisteredUsersComponent } from './registered-users/registered-users.component';
import { InviteComponent } from './invite/invite.component';
import { MeetingComponent } from './meeting/meeting.component';
import { EventAttendeesComponent } from './event-attendees/event-attendees.component';
import { SettingComponent } from '../pages/setting/setting.component';
import { NotFoundComponent } from '../pages/not-found/not-found.component';
import { MyEventsComponent } from './my-events/my-events.component';
import { NotificationsComponent } from '../pages/notifications/notifications.component';
import { eventResolver } from '../resolvers/event.resolver';
import { Event } from '../models/Event';
import { BreadcrumbDefEntry } from '../models/BreadcrumbDef';

const eventOf = (data: Record<string, unknown>) => data['event'] as Event;

const MY_EVENTS_CRUMB: BreadcrumbDefEntry = { label: 'My Events', link: '/organizer/dashboard/my_events' };

const EVENT_TITLE_CRUMB: BreadcrumbDefEntry = {
  label: (data) => eventOf(data).title,
  link: (data: Record<string, unknown>) => ['/organizer/dashboard/events', eventOf(data)._id, 'view'],
};

const MEETING_CRUMB: BreadcrumbDefEntry = {
  label: 'Meeting',
  link: (data: Record<string, unknown>) => ['/organizer/dashboard/events', eventOf(data)._id, 'meeting'],
};

export const MOD_ORGANIZER_ROUTES: Routes = [
  {
    path: "home",
    component: HomeComponent,
  },
  {
    path: "events",
    component: EventsComponent,
  },
  {
    path: "my_events",
    component: MyEventsComponent,
    data: { breadcrumb: ['My Events'] },
  },
  {
    path: "events/:id/view",
    component: EventViewComponent,
    resolve: { event: eventResolver },
    data: { breadcrumb: [MY_EVENTS_CRUMB, EVENT_TITLE_CRUMB] },
  },
  {
    path: "events/:id/registered_users",
    component: RegisteredUsersComponent,
    resolve: { event: eventResolver },
    data: { breadcrumb: [MY_EVENTS_CRUMB, EVENT_TITLE_CRUMB, 'Registered Users'] },
  },
  {
    path: "events/:id/invite",
    component: InviteComponent,
    resolve: { event: eventResolver },
    data: { breadcrumb: [MY_EVENTS_CRUMB, EVENT_TITLE_CRUMB, 'Invite Users'] },
  },
  {
    path: "events/:id/meeting",
    children: [
      {
        path: "",
        component: MeetingComponent,
        resolve: { event: eventResolver },
        data: { breadcrumb: [MY_EVENTS_CRUMB, EVENT_TITLE_CRUMB, MEETING_CRUMB] },
      },
      {
        path: "attendees",
        component: EventAttendeesComponent,
        resolve: { event: eventResolver },
        data: { breadcrumb: [MY_EVENTS_CRUMB, EVENT_TITLE_CRUMB, MEETING_CRUMB, 'Attendees'] },
      },
    ],
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
