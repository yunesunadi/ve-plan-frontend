import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SkeletonVariant = 'text' | 'title' | 'circle' | 'rect' | 'card' | 'table-row';

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './skeleton.component.scss',
  imports: [],
})
export class SkeletonComponent {
  variant = input<SkeletonVariant>('text');
  lines = input<number>(1);
  rows = input<number>(5);
  width = input<string>('100%');
  height = input<string>('');

  protected readonly rowArray = computed(() => Array.from({ length: Math.max(1, this.rows()) }));

  protected readonly resolvedHeight = computed(() => {
    if (this.height()) return this.height();
    switch (this.variant()) {
      case 'title':
        return '28px';
      case 'circle':
        return '40px';
      case 'rect':
        return '160px';
      default:
        return '14px';
    }
  });

  protected readonly resolvedWidth = computed(() => {
    if (this.variant() === 'circle' && this.width() === '100%') return this.resolvedHeight();
    return this.width();
  });

  protected readonly textBars = computed<string[]>(() => {
    const count = Math.max(1, this.lines());
    return Array.from({ length: count }, (_, index) =>
      index === count - 1 && count > 1 ? '70%' : this.resolvedWidth(),
    );
  });
}
