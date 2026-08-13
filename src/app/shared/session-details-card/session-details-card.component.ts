import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Session } from '../../models/Session';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-session-details-card',
    templateUrl: './session-details-card.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './session-details-card.component.scss',
    imports: [MatCard, MatCardContent, MatIcon, DatePipe]
})
export class SessionDetailsCardComponent {
  @Input() session = <Session>{};
}
