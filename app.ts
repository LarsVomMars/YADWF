import { serve, type ServeInit } from "./deps.ts";
import { Handler, Method, Router } from "./router/mod.ts";
import { Context } from "./context/mod.ts";

export default class YADWF {
  #router: Router;
  constructor() {
    this.#router = new Router();
  }

  public async start(options?: ServeInit) {
    await serve(async (req: Request) => {
      const context = new Context(req);
      const handler = this.#router.find(context);
      await handler(context);
      return context.response;
    }, options);
  }

  public get(path: string, handler: Handler) {
    this.#router.add(Method.GET, path, handler);
  }
}
