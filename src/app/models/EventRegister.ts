import { Event } from "./Event";
import { User } from "./User";
import { GeneralResponse, Response, Timestamp, PageMeta } from "./Utils";

export interface EventRegister {
  _id: string;
  event: Event;
  user: User;
  register_approved: boolean;
  meeting_started: boolean;
}

export type GetEventRegistersResponse = GeneralResponse & Response<"data", Array<Timestamp & EventRegister>>;

export type GetPagedEventRegistersResponse = GetEventRegistersResponse & { meta: PageMeta };

export interface ApproveResultEntry {
  _id: string;
  name: string;
}

export interface ApproveResult {
  approved: ApproveResultEntry[];
  skipped: ApproveResultEntry[];
}

export type ApproveResultResponse = GeneralResponse & Response<"data", ApproveResult>;
