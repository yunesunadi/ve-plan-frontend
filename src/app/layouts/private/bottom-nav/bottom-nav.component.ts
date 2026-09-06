import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { NavDestination } from '../nav-destinations';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './bottom-nav.component.scss',
  imports: [RouterLink, RouterLinkActive, MatIcon],
})
export class BottomNavComponent {
  destinations = input.required<NavDestination[]>();

  protected readonly primaryDestinations = computed(() =>
    this.destinations().filter((destination) => destination.primary),
  );
}
