import { HTTPOptions, serve, Server } from "./deps.ts";
import { Context } from "./context.ts";
import { HTTPMethods, Method, Router } from "./router.ts";

export type Handler = (c: Context) => Promise<void> | void;

export class Application {
  #server?: Server;
  #router: Router;

  constructor() {
    this.#router = new Router();
  }

  private async startServer(server: Server) {
    this.#server = server;
    for await (const req of this.#server) {
      const c = new Context(req);
      console.log(c.method, c.path, c.query, c.url.toString());
      const hdl = this.#router.find(HTTPMethods.indexOf(c.method), c.path);
      await hdl(c);
      req.respond(c.response);
    }
  }

  start(options: HTTPOptions) {
    this.startServer(serve(options));
  }

  get(path: string, handler: Handler): Application {
    this.#router.add(Method.GET, path, handler);
    return this;
  }

  post(path: string, handler: Handler): Application {
    this.#router.add(Method.POST, path, handler);
    return this;
  }

  put(path: string, handler: Handler): Application {
    this.#router.add(Method.PUT, path, handler);
    return this;
  }

  delete(path: string, handler: Handler): Application {
    this.#router.add(Method.DELETE, path, handler);
    return this;
  }

  trace(path: string, handler: Handler): Application {
    this.#router.add(Method.TRACE, path, handler);
    return this;
  }

  options(path: string, handler: Handler): Application {
    this.#router.add(Method.OPTIONS, path, handler);
    return this;
  }

  patch(path: string, handler: Handler): Application {
    this.#router.add(Method.PATCH, path, handler);
    return this;
  }

  connect(path: string, handler: Handler): Application {
    this.#router.add(Method.CONNECT, path, handler);
    return this;
  }

  head(path: string, handler: Handler): Application {
    this.#router.add(Method.HEAD, path, handler);
    return this;
  }

  any(path: string, handler: Handler): Application {
    const methods = Object.values(Method).filter((n) => typeof n === "number");
    for (const method of methods) {
      this.#router.add(method as Method, path, handler);
    }
    return this;
  }
}
