import { EventType } from "./Event";
import { User } from "./User";
import { GeneralResponse, Response, Timestamp } from "./Utils";

export type NotificationType = "first_time_register" | "event_created" | "register_approved" | "event_invited" | "meeting_started" | "meeting_ended" | "event_updated";

export interface NotificationSender {
  _id: string;
  title?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  type?: EventType;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  recipient: User;
  sender?: NotificationSender | string;
  isRead: boolean;
  readAt?: Date;
}

export interface NotificationMeta {
  total: number;
  unread: number;
  offset: number;
  limit: number;
}

export type GetNotificationsResponse = GeneralResponse & Response<"data", Array<Timestamp & Notification>> & { meta: NotificationMeta };
