import { Context } from "../context/mod.ts";
import Node from "./node.ts";
import { getPaths } from "../util.ts";
import { Handler, NotFoundHandler } from "./handler.ts";
import { Method } from "./method.ts";

export default class Router {
  #root: Node;
  constructor() {
    this.#root = new Node();
  }

  public add(method: Method, path: string, handler: Handler) {
    const paths = getPaths(path);
    this.#root.add(method, paths, handler);
  }

  public find(context: Context): Handler {
    const { method, path } = context;
    console.log(method, path);
    const paths = getPaths(path);
    const node = this.#root.find(method, paths);
    return node ?? NotFoundHandler;
  }
}
