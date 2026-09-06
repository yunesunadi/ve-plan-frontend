import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

export type LayoutMode = 'compact' | 'medium' | 'expanded';

const NAV_EXPANDED_KEY = 'nav_expanded';

export const LAYOUT_COMPACT_QUERY = '(max-width: 767.98px)';
export const LAYOUT_MEDIUM_QUERY = '(min-width: 768px) and (max-width: 991.98px)';
export const LAYOUT_EXPANDED_QUERY = '(min-width: 992px)';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private breakpointObserver = inject(BreakpointObserver);

  readonly mode: Signal<LayoutMode> = toSignal(
    this.breakpointObserver
      .observe([LAYOUT_COMPACT_QUERY, LAYOUT_MEDIUM_QUERY, LAYOUT_EXPANDED_QUERY])
      .pipe(
        map((state) => {
          if (state.breakpoints[LAYOUT_COMPACT_QUERY]) return 'compact';
          if (state.breakpoints[LAYOUT_MEDIUM_QUERY]) return 'medium';
          return 'expanded';
        }),
      ),
    { initialValue: 'expanded' },
  );

  readonly isCompact = computed(() => this.mode() === 'compact');
  readonly isExpanded = computed(() => this.mode() === 'expanded');

  readonly navExpanded = signal<boolean>(this.readNavExpanded());

  toggleNav(): void {
    const next = !this.navExpanded();
    this.navExpanded.set(next);
    localStorage.setItem(NAV_EXPANDED_KEY, String(next));
  }

  private readNavExpanded(): boolean {
    const stored = localStorage.getItem(NAV_EXPANDED_KEY);
    return stored === null ? true : stored === 'true';
  }
}
