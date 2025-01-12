export interface GeneralResponse {
  status: "success" | "error";
  message: string;
}

export type Response<K extends string, T> = GeneralResponse & {
  [key in K]: T;
}

export interface JWTPayload {
  __v: number;
  iat: number;
  exp: number;
}
