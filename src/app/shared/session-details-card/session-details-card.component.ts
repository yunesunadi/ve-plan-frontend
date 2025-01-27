import { Component, Input } from '@angular/core';
import { Session } from '../../models/Session';

@Component({
  standalone: false,
  selector: 'app-session-details-card',
  templateUrl: './session-details-card.component.html',
  styleUrl: './session-details-card.component.scss'
})
export class SessionDetailsCardComponent {
  @Input() session = <Session>{};
}
