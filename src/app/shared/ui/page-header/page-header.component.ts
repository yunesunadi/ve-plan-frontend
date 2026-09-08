import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { Breadcrumb } from '../../../models/Breadcrumb';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { BreadcrumbService } from '../../../services/breadcrumb.service';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './page-header.component.scss',
  imports: [RouterLink, MatIcon, BreadcrumbsComponent],
})
export class PageHeaderComponent {
  private breadcrumbService = inject(BreadcrumbService);

  title = input.required<string>();
  subtitle = input<string>('');
  backTo = input<string | any[] | null>(null);
  backLabel = input<string>('Back');
  crumbs = input<Breadcrumb[] | undefined>(undefined);
  headingLevel = input<1 | 2>(1);

  protected readonly effectiveCrumbs = computed(() => {
    const crumbs = this.crumbs() ?? this.breadcrumbService.crumbs();

    if (
      crumbs.length === 1 &&
      crumbs[0].label.trim().toLowerCase() === this.title().trim().toLowerCase()
    ) {
      return [];
    }

    return crumbs;
  });
}
