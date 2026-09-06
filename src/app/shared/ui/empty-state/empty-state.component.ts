import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './empty-state.component.scss',
  imports: [MatIcon, MatButton],
})
export class EmptyStateComponent {
  icon = input<string>('inbox');
  headline = input.required<string>();
  supporting = input<string>('');
  ctaLabel = input<string>('');
  ctaIcon = input<string>('');
  compact = input<boolean, unknown>(false, { transform: booleanAttribute });

  ctaClick = output<void>();
}
