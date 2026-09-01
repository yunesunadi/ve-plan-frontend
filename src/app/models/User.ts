import { JWTPayload } from "./Utils";

export type RoleType = "organizer" | "attendee";

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
  role: RoleType;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  googleId?: string;
  facebookId?: string;
  hasPassword?: boolean;
}

export type UserPayload = {
  _id: string;
  role: RoleType;
  tokenVersion: number;
} & JWTPayload;