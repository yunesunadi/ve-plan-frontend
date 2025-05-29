import { Event } from "./Event";
import { Timestamp, GeneralResponse, Response } from "./Utils";

export interface Session {
  _id: string;
  title: string;
  description: string;
  speaker_info: string;
  start_time: any;
  end_time: any;
  event: Event;
}

export type CreateSessionResponse = GeneralResponse & Response<"data", Timestamp & Session>;

export type GetSessionsResponse = GeneralResponse & Response<"data", Array<Timestamp & Session>>;

export type GetSessionResponse = GeneralResponse & Response<"data", Timestamp & Session>;