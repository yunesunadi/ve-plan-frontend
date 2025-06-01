import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModAttendeeRoutingModule } from './mod-attendee-routing.module';
import { HomeComponent } from './home/home.component';
import { EventViewComponent } from './event-view/event-view.component';
import { InvitationsComponent } from './invitations/invitations.component';
import { JoinedEventsComponent } from './joined-events/joined-events.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../shared/shared.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [
    HomeComponent,
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
    FormsModule,
    MatSelectModule,
    MatMenuModule,
  ]
})
export class ModAttendeeModule { }
