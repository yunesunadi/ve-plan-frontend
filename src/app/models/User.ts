import { Timestamp, JWTPayload } from "./Utils";

export interface SignUpData {
  profile?: File;
  name: string;
  email: string;
  password: string;
}

export interface User {
  _id: string;
  profile?: string;
  name: string;
  email: string;
  role: string;
}

export type UserPayload = User & Timestamp & JWTPayload;