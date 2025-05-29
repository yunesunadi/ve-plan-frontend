import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterWrapperComponent } from './register-wrapper/register-wrapper.component';
import { MatButtonModule } from '@angular/material/button';
import { OutletInnerComponent } from './outlet-inner/outlet-inner.component';
import { EventDetailsCardComponent } from './event-details-card/event-details-card.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { SessionDetailsCardComponent } from './session-details-card/session-details-card.component';

@NgModule({
  declarations: [
    RegisterWrapperComponent,
    OutletInnerComponent,
    EventDetailsCardComponent,
    SessionDetailsCardComponent,
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  exports: [
    RegisterWrapperComponent,
    OutletInnerComponent,
    EventDetailsCardComponent,
    SessionDetailsCardComponent,
  ]
})
export class SharedModule { }
