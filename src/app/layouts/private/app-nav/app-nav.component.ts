import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDivider } from '@angular/material/divider';
import { NavDestination } from '../nav-destinations';

interface SecondaryLink {
  label: string;
  icon: string;
  link?: string;
  href?: string;
}

const SETTINGS_LINK: SecondaryLink = { label: 'Settings', icon: 'settings', link: 'setting' };

const LEGAL_LINKS: SecondaryLink[] = [
  { label: 'Terms and Conditions', icon: 'gavel', href: '/terms_and_conditions' },
  { label: 'Privacy Policy', icon: 'privacy_tip', href: '/privacy_policy' },
];

@Component({
  selector: 'app-nav',
  templateUrl: './app-nav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app-nav.component.scss',
  host: { '[class.app-nav--rail]': '!expanded()' },
  imports: [RouterLink, RouterLinkActive, MatIcon, MatTooltip, MatDivider],
})
export class AppNavComponent {
  destinations = input.required<NavDestination[]>();
  expanded = input.required<boolean>();
  compact = input<boolean>(false);

  linkActivated = output<void>();

  protected readonly legalLinks = LEGAL_LINKS;

  protected readonly settingsLink = computed(() =>
    this.compact() ? null : SETTINGS_LINK,
  );
}
