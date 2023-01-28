export default class Context {
  #request: Request;

  #message: string;
  #headers: Headers;
  #status: number;
  #statusText: string;
  #url: URL;

  constructor(req: Request) {
    this.#request = req;
    this.#message = "";
    this.#headers = new Headers();
    this.#status = 200;
    this.#statusText = "OK";
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

  public status(code: number, text?: string): Context {
    this.#status = code;
    if (text) this.#statusText = text;
    return this;
  }

  public json(data: unknown): Context {
    this.#headers.set("Content-Type", "application/json");
    this.#message = JSON.stringify(data);
    return this;
  }

  public text(data: string): Context {
    this.#headers.set("Content-Type", "text/plain");
    this.#message = data;
    return this;
  }
}
