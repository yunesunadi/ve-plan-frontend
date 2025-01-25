import { Basic, GeneralResponse, Response } from "./Utils";

export interface Session {
  title: string;
  description: string;
  speaker_info: string;
  start_time: string;
  end_time: string;
  event: Event;
}

export type CreateSessionResponse = GeneralResponse & Response<"data", Basic & Session>;

export type GetSessionsResponse = GeneralResponse & Response<"data", Array<Basic & Session>>;