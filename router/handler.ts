import { Status, STATUS_TEXT } from "../deps.ts";
import { Context } from "../context/mod.ts";

export type Handler = (context: Context) => Promise<void> | void;

export function NotFoundHandler(ctx: Context) {
  ctx.status(Status.NotFound).text(STATUS_TEXT[Status.NotFound]);
}
