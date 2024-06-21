import { STATUS_CODE, STATUS_TEXT } from "@std/http";
import type { Context } from "../context/mod.ts";

export type Handler = (
  context: Context,
) => Promise<void | Context> | void | Context;

export function NotFoundHandler(ctx: Context) {
  ctx.status(STATUS_CODE.NotFound).text(STATUS_TEXT[STATUS_CODE.NotFound]);
}

export type HandlerResult = {
  handler: Handler | undefined;
  params: Record<string, string>;
};

export const EMPTY_HANDLER: HandlerResult = { handler: undefined, params: {} };
