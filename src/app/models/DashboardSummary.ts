import { Timestamp, GeneralResponse, Response } from './Utils';
import { Event } from './Event';

export type RecentActivityType = 'registration' | 'invitation_accepted' | 'meeting_started';

export interface RecentActivityItem {
  type: RecentActivityType;
  event_id: string;
  event_title: string | null;
  actor_name: string | null;
  at: string;
}

export interface OrganizerSummary {
  upcoming_events_count: number;
  registrations_awaiting_approval_count: number;
  pending_invitations_count: number;
  next_event: (Timestamp & Event) | null;
  live_meeting: { event_id: string; title: string | null } | null;
  recent_activity: RecentActivityItem[];
}

export interface AttendeeSummary {
  happening_now: Array<Timestamp & Event>;
  starting_soon: Array<Timestamp & Event>;
  pending_invitations: Array<Timestamp & Event>;
  recommended: Array<Timestamp & Event>;
}

export type OrganizerSummaryResponse = GeneralResponse & Response<'data', OrganizerSummary>;
export type AttendeeSummaryResponse = GeneralResponse & Response<'data', AttendeeSummary>;
