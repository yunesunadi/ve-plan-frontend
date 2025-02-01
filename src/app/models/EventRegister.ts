import { Event } from "./Event";
import { User } from "./User";
import { GeneralResponse, Response, Timestamp } from "./Utils";

export interface EventRegister {
  id: string;
  event: Event;
  user: User;
  register_approved: boolean;
}

export type GetEventRegistersResponse = GeneralResponse & Response<"data", Array<Timestamp & EventRegister>>;