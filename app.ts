import { serve } from "./deps.ts";
import type { ServeInit } from "./deps.ts";
import { Router } from "./router/mod.ts";
import { Context } from "./context/mod.ts";

export class YADWF {
  #router: Router;
  constructor() {
    this.#router = new Router();
  }

  private handleRequest(req: Request): Response | Promise<Response> {
    const context = new Context(req);
    // TODO: Handle request via router
    return context.response;
  }

  public async start(options?: ServeInit) {
    await serve(this.handleRequest, options);
  }
}
