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
import { PageLoadingComponent } from './page-loading/page-loading.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    RegisterWrapperComponent,
    OutletInnerComponent,
    EventDetailsCardComponent,
    SessionDetailsCardComponent,
    NotificationsComponent,
    PageLoadingComponent,
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    RegisterWrapperComponent,
    OutletInnerComponent,
    EventDetailsCardComponent,
    SessionDetailsCardComponent,
    NotificationsComponent,
    PageLoadingComponent,
  ]
})
export class SharedModule { }
