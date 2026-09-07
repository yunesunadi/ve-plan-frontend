import { RoleType } from '../../models/User';

export interface NavDestination {
  label: string;
  icon: string;
  link: string;
  /** Shown in the bottom nav below md (max 4 per role). All others are drawer-only. */
  primary: boolean;
}

export const NAV_DESTINATIONS: Record<RoleType, NavDestination[]> = {
  organizer: [
    { label: 'Home', icon: 'dashboard', link: 'home', primary: true },
    { label: 'Events', icon: 'event', link: 'events', primary: true },
    { label: 'My Events', icon: 'date_range', link: 'my_events', primary: true },
    { label: 'Calendar', icon: 'calendar_month', link: 'calendar', primary: true },
  ],
  attendee: [
    { label: 'Home', icon: 'dashboard', link: 'home', primary: true },
    { label: 'Events', icon: 'event', link: 'events', primary: true },
    { label: 'My Events', icon: 'confirmation_number', link: 'my_events', primary: true },
    { label: 'Calendar', icon: 'calendar_month', link: 'calendar', primary: true },
  ],
};
