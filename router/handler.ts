import { Status, STATUS_TEXT } from "http";
import type { Context } from "../context/mod.ts";

export type Handler = (
  context: Context,
) => Promise<void | Context> | void | Context;

export function NotFoundHandler(ctx: Context) {
  ctx.status(Status.NotFound).text(STATUS_TEXT[Status.NotFound]);
}

export type HandlerResult = {
  handler: Handler | undefined;
  params: Record<string, string>;
};

export const EMPTY_HANDLER: HandlerResult = { handler: undefined, params: {} };
export function makeHandlerResult(
  handler: Handler | undefined,
  params: Record<string, string> = {},
): HandlerResult {
  return { handler, params };
}
