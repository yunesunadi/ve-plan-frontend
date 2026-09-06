import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './submit-button.component.scss',
  imports: [MatButton, MatProgressSpinner],
})
export class SubmitButtonComponent {
  label = input.required<string>();
  busy = input.required<boolean>();
  busyLabel = input<string>('');
  disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
}
