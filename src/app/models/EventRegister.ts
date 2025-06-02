import { Event } from "./Event";
import { User } from "./User";
import { GeneralResponse, Response, Timestamp } from "./Utils";

export interface EventRegister {
  _id: string;
  event: Event;
  user: User;
  register_approved: boolean;
  meeting_started: boolean;
}

export type GetEventRegistersResponse = GeneralResponse & Response<"data", Array<Timestamp & EventRegister>>;
