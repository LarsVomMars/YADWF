import { Handler } from "./app.ts";
import { Context } from "./context.ts";
import { Status } from "./deps.ts";

export class Router {
  #handler: Array<Array<Node>>;

  constructor() {
    this.#handler = [];
    for (const e of HTTPMethods) this.#handler.push([]);
  }

  add(method: Method, path: string, handler: Handler) {
    if (!path.startsWith("/")) path = "/" + path;
    this.#handler[method].push({ path, handler });
  }

  find(method: Method, path: string): Handler {
    const paths = this.#handler[method].filter((node) => node.path === path);
    if (paths.length >= 1) {
      return paths[0].handler;
    } else {
      return (c: Context) => c.text("404 Not found", Status.NotFound);
    }
  }
}

export interface Node {
  path: string;
  handler: Handler;
}

export enum Method {
  GET,
  POST,
  PUT,
  DELETE,
  HEAD,
  CONNECT,
  OPTIONS,
  TRACE,
  PATCH,
}

export const HTTPMethods = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "HEAD",
  "CONNECT",
  "OPTIONS",
  "TRACE",
  "PATCH",
];
