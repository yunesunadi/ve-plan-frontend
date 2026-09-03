import { Event } from "./Event";
import { User } from "./User";
import { GeneralResponse, Response, Timestamp, PageMeta } from "./Utils";

export interface EventInvite {
  _id: string;
  event: Event;
  user: User;
  invitation_sent: boolean;
  invitation_accepted: boolean;
  meeting_started: boolean;
}

export type GetEventInvitesResponse = GeneralResponse & Response<"data", Array<Timestamp & EventInvite>>;

export type GetEventAcceptedInvitesResponse = GetEventInvitesResponse;

export type GetPagedEventInvitesResponse = GetEventInvitesResponse & { meta: PageMeta };

export interface InviteResultEntry {
  _id: string;
  name: string;
}

export interface InviteResult {
  invited: InviteResultEntry[];
  skipped: InviteResultEntry[];
}

export type InviteResultResponse = GeneralResponse & Response<"data", InviteResult>;