import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModAttendeeRoutingModule } from './mod-attendee-routing.module';
import { HomeComponent } from './home/home.component';
import { EventsComponent } from './events/events.component';
import { EventViewComponent } from './event-view/event-view.component';
import { InvitationsComponent } from './invitations/invitations.component';
import { JoinedEventsComponent } from './joined-events/joined-events.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../shared/shared.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    HomeComponent,
    EventsComponent,
    EventViewComponent,
    InvitationsComponent,
    JoinedEventsComponent,
  ],
  imports: [
    CommonModule,
    ModAttendeeRoutingModule,
    SharedModule,
    MatCardModule,
    MatIconModule,
    FullCalendarModule,
    MatButtonModule,
  ]
})
export class ModAttendeeModule { }
