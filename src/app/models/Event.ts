import { User } from "./User";
import { Basic, GeneralResponse, Response } from "./Utils";

export interface Event {
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  category: "conference" | "meetup" | "webinar";
  type: "public" | "private";
  user: User;
}

export type CreateEventResponse = GeneralResponse & Response<"data", Basic & Event>;

export type GetEventsResponse = GeneralResponse & Response<"data", Array<Basic & Event>>;

export type GetEventResponse = GeneralResponse & Response<"data", Basic & Event>;
