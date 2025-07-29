import { User } from "./User";
import { Timestamp, GeneralResponse, Response } from "./Utils";

export type EventTimeType = "upcoming" | "happening" | "past";

export type EventCategoryType = "conference" | "meetup" | "webinar";

export type EventType = "public" | "private";

export type MyEventType = "all" | "public" | "private";

export interface Event {
  _id: string;
  cover: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  category: EventCategoryType;
  type: EventType;
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

export interface MyEventQuery {
  type?: MyEventType;
  limit?: number;
  offset?: number;
}

export type CreateEventResponse = GeneralResponse & Response<"data", Timestamp & Event>;

export type GetEventsResponse = GeneralResponse & Response<"data", Array<Timestamp & Event>>;

export type GetEventResponse = GeneralResponse & Response<"data", Timestamp & Event>;
