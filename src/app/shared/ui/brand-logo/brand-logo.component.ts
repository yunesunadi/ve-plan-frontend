import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';

@Component({
  selector: 'app-brand-logo',
  templateUrl: './brand-logo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './brand-logo.component.scss',
  host: {
    role: 'img',
    'aria-label': 'VE-Plan',
    '[class.brand-logo--collapse]': 'collapseWordmark()',
  },
})
export class BrandLogoComponent {

  size = input<number>(26);
  wordmark = input(true, { transform: booleanAttribute });
  collapseWordmark = input(false, { transform: booleanAttribute });

  protected readonly wordmarkSize = computed(() => Math.round(this.size() * 0.64));
}
