import { Event } from "./Event";
import { User } from "./User";
import { GeneralResponse, Response, Timestamp } from "./Utils";

export type NotificationType = "first_time_register" | "event_created" | "register_approved" | "event_invited" | "meeting_started" | "event_updated";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  recipient: User;
  sender?: Event;
  isRead: boolean;
  readAt?: Date;
}

export type GetNotificationsResponse = GeneralResponse & Response<"data", Array<Timestamp & Notification>>;