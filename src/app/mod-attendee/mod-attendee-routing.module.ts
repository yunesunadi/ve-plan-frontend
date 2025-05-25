import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EventsComponent } from './events/events.component';
import { EventViewComponent } from './event-view/event-view.component';
import { InvitationsComponent } from './invitations/invitations.component';
import { JoinedEventsComponent } from './joined-events/joined-events.component';
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
    path: "**",
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModAttendeeRoutingModule { }
