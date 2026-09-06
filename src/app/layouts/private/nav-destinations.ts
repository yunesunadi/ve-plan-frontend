import { RoleType } from '../../models/User';

export interface NavDestination {
  label: string;
  icon: string;
  link: string;
  primary: boolean;
}

export const NAV_DESTINATIONS: Record<RoleType, NavDestination[]> = {
  organizer: [
    { label: 'Calendar', icon: 'event_note', link: 'home', primary: true },
    { label: 'Events', icon: 'event', link: 'events', primary: true },
    { label: 'My Events', icon: 'date_range', link: 'my_events', primary: true },
  ],
  attendee: [
    { label: 'Calendar', icon: 'event_note', link: 'home', primary: true },
    { label: 'Events', icon: 'event', link: 'events', primary: true },
    { label: 'Invitations', icon: 'drafts', link: 'invitations', primary: true },
    { label: 'Joined Events', icon: 'how_to_reg', link: 'joined_events', primary: true },
  ],
};
