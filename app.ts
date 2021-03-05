import { Context } from "./context.ts";
import { HTTPMethods, Method, Router } from "./router.ts";
import {
  format as timeFormat,
  HTTPOptions,
  join,
  log,
  sep,
  serve,
  Server,
} from "./deps.ts";
import { getNestedDirectories } from "./util.ts";

export type Handler = (c: Context) => Promise<void> | void;
export type Middleware = (next: Handler) => Handler;

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
      log.info(`${c.protocol} ${c.method} ${c.path}`);
      const { handler, params } = this.#router.find(
        HTTPMethods.indexOf(c.method) as Method,
        c.path,
      );
      c.params = params; // Named parameters
      try {
        await handler(c);
      } catch (e) {
        log.error(e);
      }
      req.respond(c.response);
    }
  }

  private applyMiddleware(
    handler: Handler,
    ...middlewares: Middleware[]
  ): Handler {
    for (const middleware of middlewares) {
      handler = middleware(handler);
    }
    return handler;
  }

  private addPath(
    path: string,
    method: Method,
    handler: Handler,
    ...middlewares: Middleware[]
  ) {
    handler = this.applyMiddleware(handler, ...middlewares);
    this.#router.add(method, path, handler);
  }

  start(options: HTTPOptions) {
    log.info(`Server started: http://localhost:${options.port}`);
    this.startServer(serve(options));
  }

  stop() {
    this.#server?.close();
  }

  get(
    path: string,
    handler: Handler,
    ...middlewares: Middleware[]
  ): Application {
    this.addPath(path, Method.GET, handler, ...middlewares);
    return this;
  }

  post(
    path: string,
    handler: Handler,
    ...middlewares: Middleware[]
  ): Application {
    this.addPath(path, Method.POST, handler, ...middlewares);
    return this;
  }

  put(
    path: string,
    handler: Handler,
    ...middlewares: Middleware[]
  ): Application {
    this.addPath(path, Method.PUT, handler, ...middlewares);
    return this;
  }

  delete(
    path: string,
    handler: Handler,
    ...middlewares: Middleware[]
  ): Application {
    this.addPath(path, Method.DELETE, handler, ...middlewares);
    return this;
  }

  trace(
    path: string,
    handler: Handler,
    ...middlewares: Middleware[]
  ): Application {
    this.addPath(path, Method.TRACE, handler, ...middlewares);
    return this;
  }

  options(
    path: string,
    handler: Handler,
    ...middlewares: Middleware[]
  ): Application {
    this.addPath(path, Method.OPTIONS, handler, ...middlewares);
    return this;
  }

  patch(
    path: string,
    handler: Handler,
    ...middlewares: Middleware[]
  ): Application {
    this.addPath(path, Method.PATCH, handler, ...middlewares);
    return this;
  }

  connect(
    path: string,
    handler: Handler,
    ...middlewares: Middleware[]
  ): Application {
    this.addPath(path, Method.CONNECT, handler, ...middlewares);
    return this;
  }

  head(
    path: string,
    handler: Handler,
    ...middlewares: Middleware[]
  ): Application {
    this.addPath(path, Method.HEAD, handler, ...middlewares);
    return this;
  }

  any(
    path: string,
    handler: Handler,
    ...middlewares: Middleware[]
  ): Application {
    const methods = Object.values(Method).filter((n) => typeof n === "number");
    for (const method of methods) {
      this.addPath(path, method as Method, handler, ...middlewares);
    }
    return this;
  }

  file(path: string, file: string, ...middlewares: Middleware[]): Application {
    this.addPath(
      path,
      Method.GET,
      async (c) => await c.file(file),
      ...middlewares,
    );
    return this;
  }

  static(
    path: string,
    directory: string,
    ...middlewares: Middleware[]
  ): Application {
    if (!path.endsWith("/")) path += "/";
    (async () => {
      const directories = await getNestedDirectories(directory);
      directories.push("");
      for (const dir of directories) {
        const hdl = async (c: Context) => {
          const file = c.path.substring(join(path, dir, sep).length);
          if (file.length === 0) {
            return await c.file(join(directory, dir, "index.html"));
          }
          return await c.file(join(directory, dir, file));
        };
        this.addPath(
          `${path + dir}/*`.replace(/\/+/, "/"),
          Method.GET,
          hdl,
          ...middlewares,
        );
      }
    })();
    return this;
  }
}

// Logging
await log.setup({
  handlers: {
    timeHandler: new log.handlers.ConsoleHandler("INFO", {
      formatter: (logRecord) =>
        `[${
          timeFormat(new Date(Date.now()), "MM-dd-yyyy HH:mm:ss")
        }] ${logRecord.msg}`,
    }),
  },
  loggers: {
    default: {
      level: "INFO",
      handlers: ["timeHandler"],
    },
  },
});
