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
    // TODO: Param as wildcard with extra class var
    if (!path.startsWith("/")) path = `/${path}`;
    const paths = path.split("/").slice(1);
    if (path.endsWith("/")) paths.pop();
    this.root.add(paths, method, handler);
  }

  find(method: Method, path: string): RouterResult {
    if (!path.startsWith("/")) path = `/${path}`;
    const paths = path.split("/").slice(1);
    if (path.endsWith("/")) paths.pop();
    const result = this.root.find(paths, method);
    return result ?? { handler: NotFoundHandler, params: {} };
  }
}

export class Node {
  private readonly subnodes: Node[];
  private readonly handlers: PathHandler[];
  private name?: string;

  constructor(private readonly path = "") {
    this.subnodes = [];
    this.handlers = [];
  }

  add(path: string[], method: Method, handler: Handler) {
    if (path.length > 1) {
      let curPath = path.shift()!;
      if (curPath.startsWith(":")) {
        this.name = curPath.slice(1);
        curPath = "*";
      }
      for (const node of this.subnodes) {
        if (node.check(curPath)) {
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

  find(path: string[], method: Method): RouterResult | undefined {
    // TODO: Get current named parameter
    if (path.length > 1) {
      const curPath = path.shift()!;
      const searchNode = this.subnodes.find((node) => node.check(curPath));
      if (searchNode) return searchNode.find(path, method);
      // Wildcard matching
      for (const node of this.subnodes) {
        if (node.isWildcard()) {
          const subnode = node.find(path, method);
          if (subnode) {
            if (this.name) subnode.params[this.name] = curPath;
            return subnode;
          }
        }
      }
      return;
    } else {
      const curPath = path[0];
      const handler = this.handlers.find((hdl) => hdl.check(curPath, method));
      if (handler) return handler.get(curPath);
      for (const hdl of this.handlers) {
        if (hdl.isWildcard()) {
          return hdl.get(curPath);
        }
      }
      return;
    }
  }

  check(path: string): boolean {
    return this.path === path;
  }

  isWildcard(): boolean {
    return this.path === "*";
  }
}

export class PathHandler {
  private readonly name?: string;
  constructor(
    private readonly path: string,
    private readonly method: Method,
    private readonly handler: Handler,
  ) {
    if (this.path.startsWith(":")) {
      this.name = this.path.slice(1);
      this.path = "*";
    }
  }

  check(path: string, method: Method): boolean {
    return this.path === path && this.method === method;
  }

  isWildcard(): boolean {
    return this.path === "*";
  }

  get(path: string): RouterResult {
    const params: Record<string, string> = {};
    if (this.name) params[this.name] = path;
    return { handler: this.handler, params };
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

export interface RouterResult {
  handler: Handler;
  params: Record<string, string>;
}

export const NotFoundHandler: Handler = (c: Context) =>
  c.text("404 Not found", Status.NotFound);
