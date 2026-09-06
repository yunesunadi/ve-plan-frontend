import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { Breadcrumb } from '../../../models/Breadcrumb';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './breadcrumbs.component.scss',
  imports: [RouterLink, MatIcon],
})
export class BreadcrumbsComponent {
  crumbs = input.required<Breadcrumb[]>();

  protected readonly lastCrumb = computed<Breadcrumb | null>(() => {
    const list = this.crumbs();
    return list.length ? list[list.length - 1] : null;
  });
}
