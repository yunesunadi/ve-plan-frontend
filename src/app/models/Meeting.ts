import { Event } from "./Event";
import { User } from "./User";
import { Timestamp, GeneralResponse, Response } from "./Utils";

export interface Meeting {
  _id: string;
  event: Event;
  user: User;
  room_name: string;
  start_time: string;
  end_time: string;
  duration: number;
  ended: boolean;
  ended_at: string | null;
}

export type CreateMeetingResponse = GeneralResponse & Response<"data", Timestamp & Meeting>;

export type GetMeetingResponse = CreateMeetingResponse;

export interface AttendeeMeeting {
  room_name: string;
  ended: boolean;
  starts_at: string | null;
}

export type AttendeeMeetingResponse = GeneralResponse & Response<"data", AttendeeMeeting>;

export type CreateTokenResponse = GeneralResponse & Response<"token", string> & Response<"room_name", string>;
