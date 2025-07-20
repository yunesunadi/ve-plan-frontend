import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterWrapperComponent } from './register-wrapper/register-wrapper.component';
import { MatButtonModule } from '@angular/material/button';
import { OutletInnerComponent } from './outlet-inner/outlet-inner.component';
import { EventDetailsCardComponent } from './event-details-card/event-details-card.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { SessionDetailsCardComponent } from './session-details-card/session-details-card.component';
import { NotificationsComponent } from '../pages/notifications/notifications.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [
    RegisterWrapperComponent,
    OutletInnerComponent,
    EventDetailsCardComponent,
    SessionDetailsCardComponent,
    NotificationsComponent,
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  exports: [
    RegisterWrapperComponent,
    OutletInnerComponent,
    EventDetailsCardComponent,
    SessionDetailsCardComponent,
    NotificationsComponent,
  ]
})
export class SharedModule { }
