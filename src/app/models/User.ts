import { JWTPayload } from "./Utils";

export interface User {
  _id: string;
  profile?: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export type UserPayload = User & JWTPayload;