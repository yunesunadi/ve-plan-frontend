import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModOrganizerRoutingModule } from './mod-organizer-routing.module';
import { HomeComponent } from './home/home.component';
import { EventViewComponent } from './event-view/event-view.component';
import { RegisteredUsersComponent } from './registered-users/registered-users.component';
import { InviteComponent } from './invite/invite.component';
import { MeetingComponent } from './meeting/meeting.component';
import { EventAttendeesComponent } from './event-attendees/event-attendees.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { SharedModule } from '../shared/shared.module';
import { MatMenuModule } from '@angular/material/menu';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    HomeComponent,
    EventViewComponent,
    RegisteredUsersComponent,
    InviteComponent,
    MeetingComponent,
    EventAttendeesComponent,
  ],
  imports: [
    CommonModule,
    ModOrganizerRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    FullCalendarModule,
    MatMenuModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
  ]
})
export class ModOrganizerModule { }
