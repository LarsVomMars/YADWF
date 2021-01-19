import { Response, ServerRequest } from "./deps.ts";
import { decode, encode } from "./deps.ts";

export class Context {
  #request: ServerRequest;
  #response: Response;
  #url: URL;

  constructor(request: ServerRequest) {
    this.#request = request;
    this.#response = { headers: new Headers() };
    this.#url = new URL(this.#request.url, "http://0.0.0.0");
  }

  get response(): Response {
    return this.#response;
  }

  get method(): string {
    return this.#request.method;
  }

  get url(): URL {
    return this.#url;
  }

  get path(): string {
    return this.#url.pathname;
  }

  get query(): Record<string, string | string[]> {
    const query: Record<string, string | string[]> = {};
    for (const [key, value] of this.#url.searchParams) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        if (Array.isArray(query[key])) {
          (query[key] as string[]).push(value);
        } else {
          query[key] = [query[key] as string, value];
        }
      } else {
        query[key] = value;
      }
    }
    return query;
  }

  // TODO: Codes
  text(text: string, code = 200) {
    this.#response.status = code;
    this.#response.body = encode(text);
    this.#response.headers?.append("Content-Type", "text/plain;charset=UTF-8");
  }
}
