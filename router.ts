import { Handler } from "./app.ts";
import { Context } from "./context.ts";
import { Status } from "./deps.ts";

export class Router {
  private readonly root: Node;

  constructor() {
    this.root = new Node();
  }

  add(method: Method, path: string, handler: Handler) {
    // TODO: Named routes :name -> ctx.params.name
    if (!path.startsWith("/")) path = `/${path}`;
    const paths = path.split("/").slice(1);
    if (path.endsWith("/")) paths.pop();
    this.root.add(paths, method, handler);
  }

  find(method: Method, path: string): Handler {
    const paths = path.split("/").slice(1);
    if (path.endsWith("/")) paths.pop();
    const handler = this.root.find(paths, method);
    return handler || NotFoundHandler;
  }
}

export class Node {
  private readonly subnodes: Node[];
  private readonly handlers: PathHandler[];

  constructor(private readonly path = "") {
    this.subnodes = [];
    this.handlers = [];
  }

  add(path: string[], method: Method, handler: Handler) {
    if (path.length > 1) {
      const curPath = path.shift();
      for (const node of this.subnodes) {
        if (node.check(curPath!)) {
          node.add(path, method, handler);
          return;
        }
      }
      const node = new Node(curPath);
      node.add(path, method, handler);
      this.subnodes.push(node);
    } else {
      this.handlers.push(new PathHandler(path[0], method, handler));
    }
  }

  find(path: string[], method: Method): Handler | undefined {
    if (path.length > 1) {
      const curPath = path.shift()!;
      const node = this.subnodes.find((node) => node.check(curPath));
      return node?.find(path, method);
    } else {
      const handler = this.handlers.find((hdl) => hdl.check(path[0], method));
      return handler?.get();
    }
  }

  check(path: string): boolean {
    return this.path === path;
  }
}

export class PathHandler {
  constructor(
    private readonly path: string,
    private readonly method: Method,
    private readonly handler: Handler,
  ) {}

  check(path: string, method: Method): boolean {
    return (this.path === path) && this.method === method;
  }

  get(): Handler {
    return this.handler;
  }
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

export const NotFoundHandler = (c: Context) =>
  c.text("404 Not found", Status.NotFound);
