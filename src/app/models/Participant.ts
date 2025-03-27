import { Event } from "./Event";
import { User } from "./User";

export interface MeetingParticipant {
  roomName: string;
  id: string;
  displayName: string;
  formattedDisplayName: string;
  avatarURL: string;
  breakoutRoom: boolean;
  email: string;
  visitor: boolean;
}

export interface Participant {
  _id: string;
  event: Event;
  user: User;
  room_name: string;
  start_time: string;
  end_time: string;
  duration: number;
}