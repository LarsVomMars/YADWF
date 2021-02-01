import { HTTPOptions, serve, Server } from "./deps.ts";
import { Context } from "./context.ts";
import { HTTPMethods, Method, Router } from "./router.ts";
import { format, log, join } from "./deps.ts";

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
      log.info(
        `[${format(new Date(Date.now()), "MM-dd-yyyy HH:mm:ss")}] ${
          c.protocol
        } ${c.method} ${c.path}`
      );
      const hdl = this.#router.find(
        HTTPMethods.indexOf(c.method) as Method,
        c.path
      );
      await hdl(c);
      req.respond(c.response);
    }
  }

  start(options: HTTPOptions) {
    log.info(
      `[${format(
        new Date(Date.now()),
        "MM-dd-yyyy HH:mm:ss"
      )}] Server started: http://localhost:${options.port}`
    );
    this.startServer(serve(options));
  }

  stop() {
    this.#server?.close();
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

  file(path: string, file: string): Application {
    this.#router.add(Method.GET, path, async (c) => await c.file(file));
    return this;
  }

  static(path: string, directory: string): Application {
    if (!path.endsWith("/")) path += "/";
    this.#router.add(Method.GET, `${path}*`, async (c) => {
      const file = c.path.substring(path.length);
      return await c.file(join(directory, file));
    });
    return this;
  }
}
