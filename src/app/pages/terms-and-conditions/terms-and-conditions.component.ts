import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms-and-conditions',
  imports: [RouterLink],
  templateUrl: './terms-and-conditions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './terms-and-conditions.component.scss'
})
export class TermsAndConditionsComponent {

}
