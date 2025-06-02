export interface GeneralResponse {
  status: "success" | "error";
  message: string;
}

export type Response<K extends string, T> = GeneralResponse & {
  [key in K]: T;
}

export interface JWTPayload {
  iat: number;
  exp: number;
}

export interface Timestamp {
  createdAt: string;
  updatedAt: string;
}

export interface PageQuery {
  offset?: number; 
  limit: number;
};
