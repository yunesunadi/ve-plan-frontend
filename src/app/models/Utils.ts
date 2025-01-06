export type Response<K extends string, T> = {
  status: "success" | "error";
  message: string;
} & {
  [key in K]: T;
}
