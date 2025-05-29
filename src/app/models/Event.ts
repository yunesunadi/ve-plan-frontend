import { User } from "./User";
import { Timestamp, GeneralResponse, Response } from "./Utils";

export type EventTimeType = "upcoming" | "happening" | "past";

export type EventCategoryType = "conference" | "meetup" | "webinar";

export interface Event {
  _id: string;
  cover: string;
  title: string;
  description: string;
  date: any;
  start_time: any;
  end_time: any;
  category: EventCategoryType;
  type: "public" | "private";
  user: User;
}

export interface EventQuery {
  search_value?: string;
  time?: EventTimeType;
  category?: EventCategoryType;
  date?: string;
  limit?: number;
  offset?: number;
}

export type CreateEventResponse = GeneralResponse & Response<"data", Timestamp & Event>;

export type GetEventsResponse = GeneralResponse & Response<"data", Array<Timestamp & Event>>;

export type GetEventResponse = GeneralResponse & Response<"data", Timestamp & Event>;
