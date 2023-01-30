import { Status, STATUS_TEXT } from "http";
import { Method } from "../router/method.ts";

export default class Context {
  #request: Request;

  #message: string;
  #headers: Headers;
  #status: Status;
  #statusText: string;
  #url: URL;
  #params: Record<string, string> | undefined;

  constructor(req: Request) {
    this.#request = req;
    this.#message = "";
    this.#headers = new Headers();
    this.#status = Status.OK;
    this.#statusText = STATUS_TEXT[Status.OK];
    this.#url = new URL(req.url);
  }

  get request(): Request {
    return this.#request;
  }

  get response(): Response {
    const options = {
      headers: this.#headers,
      status: this.#status,
      statusText: this.#statusText,
    };
    return new Response(this.#message, options);
  }

  get method(): Method {
    return Method[this.#request.method.toUpperCase() as keyof typeof Method];
  }

  get path(): string {
    return this.#url.pathname;
  }

  set params(params: Record<string, string>) {
    // Disable editing of params
    // TODO: Move to constructor somehow
    if (this.#params) throw new Error("Params already set");
    this.#params = params;
  }

  get params(): Record<string, string> {
    // Is always set by setter
    return this.#params!;
  }

  get query(): Record<string, unknown | unknown[]> {
    const query: Record<string, unknown | unknown[]> = {};
    for (const [key, value] of this.#url.searchParams) {
      let val = value;
      // Automatically convert query parameters to corresponding types
      // TODO: Find a way to do this without try-catch
      try {
        val = JSON.parse(value);
      } catch (_) {
        // Do nothing
      }
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        if (Array.isArray(query[key])) {
          (query[key] as unknown[]).push(val);
        } else {
          query[key] = [query[key] as unknown, val];
        }
      } else {
        query[key] = val;
      }
    }
    console.log(query);
    return query;
  }

  public status(code: number, text?: string): Context;
  public status(code: Status, text?: string): Context {
    this.#status = code;
    if (text) this.#statusText = text;
    else this.#statusText = STATUS_TEXT[code];
    return this;
  }

  public json(data: unknown): Context {
    this.#headers.set("Content-Type", "application/json");
    this.#message = JSON.stringify(data);
    return this;
  }

  // TODO: Consider any and toString
  public text(data: string): Context {
    this.#headers.set("Content-Type", "text/plain");
    this.#message = data;
    return this;
  }

  public redirect(url: string): Context {
    // TODO: Test
    // TODO: Consider adding status code
    this.#headers.append("Location", url);
    return this;
  }
}
