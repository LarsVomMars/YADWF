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

  get(path: string, handler: Handler) {
    this.#router.add(Method.GET, path, handler);
    return this;
  }
}
