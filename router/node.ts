import { Method, type Handler } from "./mod.ts";

export default class Node {
  readonly #children: Map<string, Node>;
  readonly #handlers: Map<Method, Handler>;

  constructor() {
    this.#children = new Map();
    this.#handlers = new Map();
  }

  add(method: Method, paths: string[], handler: Handler) {
    const path = paths.shift();
    if (path === undefined) {
      this.#handlers.set(method, handler);
      return;
    }
    const child = this.#children.get(path) ?? new Node();
    child.add(method, paths, handler);
    this.#children.set(path, child);
  }

  public find(method: Method, paths: string[]): Handler | undefined {
    const path = paths.shift();
    if (path === undefined) return this.#handlers.get(method);
    const child = this.#children.get(path);
    if (!child) {
      const wildcard = this.#children.get("*");
      if (!wildcard) return;
      return wildcard.find(method, paths);
    }
    return child.find(method, paths);
  }
}
