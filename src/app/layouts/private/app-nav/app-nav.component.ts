import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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

const SECONDARY_LINKS: SecondaryLink[] = [
  { label: 'Settings', icon: 'settings', link: 'setting' },
  { label: 'Terms and Conditions', icon: 'gavel', href: '/terms_and_conditions' },
  { label: 'Privacy Policy', icon: 'privacy_tip', href: '/privacy_policy' },
];

@Component({
  selector: 'app-nav',
  templateUrl: './app-nav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app-nav.component.scss',
  imports: [RouterLink, RouterLinkActive, MatIcon, MatTooltip, MatDivider],
})
export class AppNavComponent {
  destinations = input.required<NavDestination[]>();
  expanded = input.required<boolean>();

  linkActivated = output<void>();

  protected readonly secondaryLinks = SECONDARY_LINKS;
}
