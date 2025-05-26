import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EventsComponent } from '../pages/events/events.component';
import { EventViewComponent } from './event-view/event-view.component';
import { RegisteredUsersComponent } from './registered-users/registered-users.component';
import { InviteComponent } from './invite/invite.component';
import { MeetingComponent } from './meeting/meeting.component';
import { EventAttendeesComponent } from './event-attendees/event-attendees.component';
import { SettingComponent } from '../pages/setting/setting.component';
import { NotFoundComponent } from '../pages/not-found/not-found.component';

const routes: Routes = [
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
  },
  {
    path: "events/:id/registered_users",
    component: RegisteredUsersComponent,
  },
  {
    path: "events/:id/invite",
    component: InviteComponent,
  },
  {
    path: "events/:id/meeting",
    component: MeetingComponent,
  },
  {
    path: "events/:id/meeting/attendees",
    component: EventAttendeesComponent,
  },
  {
    path: "setting",
    component: SettingComponent,
  },
  {
    path: "**",
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModOrganizerRoutingModule { }
