import { EMPTY_HANDLER, HandlerResult, makeHandlerResult } from "./handler.ts";
import { type Handler, Method } from "./mod.ts";

export default class Node {
  readonly #children: Map<string, Node>;
  readonly #handlers: Map<Method, Handler>;
  #param: string | undefined;

  constructor() {
    this.#children = new Map();
    this.#handlers = new Map();
  }

  add(method: Method, paths: string[], handler: Handler) {
    let path = paths.shift();
    if (path === undefined) {
      this.#handlers.set(method, handler);
      return;
    }

    if (path.startsWith(":")) {
      this.#param = path.slice(1);
      path = "*";
    }

    const child = this.#children.get(path) ?? new Node();
    child.add(method, paths, handler);
    this.#children.set(path, child);
  }

  public find(method: Method, paths: string[]): HandlerResult {
    const path = paths.shift();
    if (path === undefined) {
      const handler = this.#handlers.get(method);
      return makeHandlerResult(handler);
    }
    const child = this.#children.get(path);
    let handler: HandlerResult;
    if (child) {
      handler = child.find(method, paths);
    } else {
      const wildcard = this.#children.get("*");
      if (!wildcard) return EMPTY_HANDLER;
      handler = wildcard.find(method, paths);
    }
    if (this.#param !== undefined) handler.params[this.#param] = path;
    return handler;
  }
}
