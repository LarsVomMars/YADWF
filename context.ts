import { Response, ServerRequest, Status } from "./deps.ts";
import { decode, encode } from "./deps.ts";
import { MultipartReader } from "./deps.ts";

export class Context {
  #request: ServerRequest;
  #response: Response;
  #url: URL;
  #body?: Promise<Record<string, unknown>>;

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

  get body(): Promise<Record<string, unknown>> {
    if (this.#body) return this.#body;
    this.#body = this.readRequestBody();
    return this.#body;
  }

  private async readRequestBody(): Promise<Record<string, unknown>> {
    const contentType = this.#request.headers.get("Content-Type");

    if (contentType?.includes("application/json")) {
      return JSON.parse(decode(await Deno.readAll(this.#request.body)));
    } else if (contentType?.includes("multipart/form-data")) {
      const match = contentType.match(/boundary=([^\s]+)/);
      const boundary = match ? match[1] : undefined;
      if (boundary) {
        const mr = new MultipartReader(this.#request.body, boundary);
        const form = await mr.readForm();
        const query: Record<string, unknown> = {};
        for (const [key, value] of form.entries()) {
          query[key] = value;
        }
        return query;
      }
      return {};
    } else if (contentType?.includes("application/x-www-form-urlencoded")) {
      const query: Record<string, string> = {};
      for (
        const [key, value] of new URLSearchParams(
          decode(await Deno.readAll(this.#request.body)),
        )
      ) {
        query[key] = value;
      }
      return query;
    } else {
      return {}; // Body?
    }
  }

  text(text: string, code = Status.OK) {
    this.#response.status = code;
    this.#response.body = encode(text);
    this.#response.headers?.append("Content-Type", "text/plain;charset=UTF-8");
  }

  json(obj: unknown, code = Status.OK) {
    this.#response.status = code;
    if (typeof obj === "object") {
      obj = JSON.stringify(obj);
    }
    this.#response.body = encode(obj as string);
    this.#response.headers?.append(
      "Content-Type",
      "application/json;charset=UTF-8",
    );
  }
}
