import { Event } from "./Event";
import { User } from "./User";
import { Timestamp, GeneralResponse, Response } from "./Utils";

export interface Meeting {
  _id: string;
  event: Event;
  user: User;
  room_name: string;
  token: string;
}

export type CreateMeetingResponse = GeneralResponse & Response<"data", Timestamp & Meeting>;

export type GetMeetingResponse = CreateMeetingResponse;