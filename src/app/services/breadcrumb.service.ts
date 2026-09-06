import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { Breadcrumb } from '../models/Breadcrumb';
import { BreadcrumbDef, BreadcrumbDefEntry } from '../models/BreadcrumbDef';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private router = inject(Router);

  crumbs = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.build()),
      startWith(this.build()),
    ),
    { initialValue: [] as Breadcrumb[] },
  );

  private build(): Breadcrumb[] {
    let leaf: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;

    while (leaf.firstChild) {
      leaf = leaf.firstChild;
    }

    const defs = (leaf.data['breadcrumb'] as BreadcrumbDefEntry[] | undefined) ?? [];
    const crumbs = defs.map((def) => this.resolve(def, leaf.data));

    if (crumbs.length > 0) {
      crumbs[crumbs.length - 1] = { ...crumbs[crumbs.length - 1], link: undefined };
    }

    return crumbs;
  }

  private resolve(def: BreadcrumbDefEntry, data: Record<string, unknown>): Breadcrumb {
    const normalized: BreadcrumbDef = typeof def === 'string' ? { label: def } : def;

    return {
      label: typeof normalized.label === 'function' ? normalized.label(data) : normalized.label,
      link: typeof normalized.link === 'function' ? normalized.link(data) : normalized.link,
    };
  }
}
