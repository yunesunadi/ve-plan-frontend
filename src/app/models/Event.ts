import { User } from "./User";
import { Timestamp, GeneralResponse, Response } from "./Utils";

export interface Event {
  _id: string;
  cover: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  category: "conference" | "meetup" | "webinar";
  type: "public" | "private";
  user: User;
}

export type CreateEventResponse = GeneralResponse & Response<"data", Timestamp & Event>;

export type GetEventsResponse = GeneralResponse & Response<"data", Array<Timestamp & Event>>;

export type GetEventResponse = GeneralResponse & Response<"data", Timestamp & Event>;
