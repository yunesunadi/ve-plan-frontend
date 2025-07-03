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
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  googleId?: string;
  facebookId?: string;
}

export type UserPayload = User & Timestamp & JWTPayload;