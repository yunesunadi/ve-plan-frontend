import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Event } from '../../models/Event';
import { environment } from '../../../environments/environment';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-event-details-card',
    templateUrl: './event-details-card.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './event-details-card.component.scss',
    imports: [MatCard, MatCardContent, MatIcon, DatePipe]
})
export class EventDetailsCardComponent {
  @Input() event = <Event>{};

  get cover_url() {
    return environment.coverUrl;
  }
}
