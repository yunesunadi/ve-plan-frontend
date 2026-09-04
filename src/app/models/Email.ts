import { GeneralResponse, Response } from "./Utils";

export interface EmailStatus {
  sent: number;
  pending: number;
  failed: number;
  retryableFailed: number;
}

export type EmailStatusResponse = GeneralResponse & Response<"data", EmailStatus>;

export type EmailRetryResponse = GeneralResponse & Response<"data", { requeued: number }>;
