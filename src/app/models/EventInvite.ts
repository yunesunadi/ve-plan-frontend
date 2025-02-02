import { Event } from "./Event";
import { User } from "./User";
import { GeneralResponse, Response, Timestamp } from "./Utils";

export interface EventInvite {
  _id: string;
  event: Event;
  user: User;
  invitation_sent: boolean;
  invitation_accepted: boolean;
}

export type GetEventInvitesResponse = GeneralResponse & Response<"data", Array<Timestamp & EventInvite>>;

export type GetEventAcceptedInvitesResponse = GetEventInvitesResponse;