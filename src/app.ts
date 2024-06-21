import { type Handler, Method, Router } from "./router/mod.ts";
import { Context } from "./context/mod.ts";

export default class YADWF {
  #router: Router;
  constructor() {
    this.#router = new Router();
  }

  public start(options: Deno.ServeOptions = {}) {
    Deno.serve(options, async (req: Request) => {
      const context = new Context(req);
      const handler = this.#router.find(context);
      await handler(context);
      return context.response;
    });
  }

  private addPath(method: Method, path: string, handler: Handler): YADWF {
    this.#router.add(method, path, handler);
    return this;
  }

  public get(path: string, handler: Handler): YADWF {
    return this.addPath(Method.GET, path, handler);
  }

  public post(path: string, handler: Handler): YADWF {
    return this.addPath(Method.POST, path, handler);
  }

  public put(path: string, handler: Handler): YADWF {
    return this.addPath(Method.PUT, path, handler);
  }

  public delete(path: string, handler: Handler): YADWF {
    return this.addPath(Method.DELETE, path, handler);
  }

  public patch(path: string, handler: Handler): YADWF {
    return this.addPath(Method.PATCH, path, handler);
  }

  public head(path: string, handler: Handler): YADWF {
    return this.addPath(Method.HEAD, path, handler);
  }

  public options(path: string, handler: Handler): YADWF {
    return this.addPath(Method.OPTIONS, path, handler);
  }

  public connect(path: string, handler: Handler): YADWF {
    return this.addPath(Method.CONNECT, path, handler);
  }

  public trace(path: string, handler: Handler): YADWF {
    return this.addPath(Method.TRACE, path, handler);
  }

  public any(path: string, handler: Handler): YADWF {
    for (const method in Method) {
      this.addPath(method as Method, path, handler);
    }
    return this;
  }
}
