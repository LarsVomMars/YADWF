import {
  Cookie,
  decode,
  deleteCookie,
  encode,
  getCookies,
  join,
  MultipartReader,
  Response,
  ServerRequest,
  setCookie,
  Status,
} from "./deps.ts";
import { getContentType } from "./mimetypes.ts";

export type Cookies = Record<string, string>;

export class Context {
  readonly #request: ServerRequest;
  readonly #response: Response;
  readonly #url: URL;
  #body?: Promise<Record<string, unknown>>;
  params: Record<string, string>;

  constructor(request: ServerRequest) {
    this.#request = request;
    this.#response = { headers: new Headers() };
    this.#url = new URL(this.#request.url, "http://0.0.0.0");
    this.params = {};
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

  get protocol(): string {
    return this.#request.proto;
  }

  get cookies(): Cookies {
    return getCookies(this.#request);
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

  setCookie(cookie: Cookie) {
    setCookie(this.#response, cookie);
  }

  deleteCookie(name: string) {
    deleteCookie(this.#response, name);
  }

  blob(blob: Uint8Array, contentType: string, code = Status.OK) {
    this.#response.status = code;
    this.#response.headers?.append("Content-Type", contentType);
    this.#response.body = blob;
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

  redirect(url: string, code = Status.Found) {
    this.#response.status = code;
    this.#response.headers?.append("Location", url);
  }

  async file(path: string, code = Status.OK) {
    try {
      path = join(Deno.cwd(), path);
      const file = await Deno.readFile(path);
      this.blob(file, getContentType(path), code);
    } catch (e) {
      return this.text("404 Not found", Status.NotFound);
    }
  }
}
