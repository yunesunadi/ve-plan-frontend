import { Component, Input } from '@angular/core';
import { Event } from '../../models/Event';
import { environment } from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-event-details-card',
  templateUrl: './event-details-card.component.html',
  styleUrl: './event-details-card.component.scss'
})
export class EventDetailsCardComponent {
  @Input() event = <Event>{};

  get cover_url() {
    return environment.coverUrl;
  }
}
