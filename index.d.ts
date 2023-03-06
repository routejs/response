declare interface context {
  res: object;
  req?: object;
}

declare interface options {
  server: string;
}

declare interface CookieOptions {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number | undefined;
  path?: string;
  priority?: boolean;
  secure?: boolean | undefined;
  partitioned?: string;
  sameSite?: boolean | "lax" | "strict" | "none";
}

declare interface Response {
  readonly headersSent: boolean;

  append(field: string, value: number | string | ReadonlyArray<string>): this;
  attachment(filename?: string): this;
  cookie(name: string, value?: any, options?: CookieOptions): this;
  clearCookie(name: string, options?: CookieOptions): this;
  download(path: string, fn?: (err: Error) => void): void;
  download(path: string, filename?: string, fn?: (err: Error) => void): void;
  get(field: string): number | string | string[] | undefined;
  has(field: string): boolean;
  header(field: string, value: number | string | ReadonlyArray<string>): this;
  json(body: any): void;
  jsonp(body: any, callback?: string): void;
  links(links: object): this;
  location(path: string): this;
  redirect(path: string, status?: number): void;
  remove(field: string): this;
  send(body: any): void;
  sendFile(path: string, fn?: (err: Error) => void): void;
  sendHeader(field: string, value?: any): void;
  sendStatus(code: number, message?: string): void;
  set(field: string, value?: any): this;
  status(code: number, message?: string): this;
  type(type: string): this;
  vary(field: string): this;
  write(buffer: Uint8Array | string, cb?: (err?: Error) => void): boolean;
  write(
    str: Uint8Array | string,
    encoding?: string,
    cb?: (err?: Error) => void
  ): boolean;
  end(callback?: () => void): this;
  end(buffer: Uint8Array | string, callback?: () => void): this;
  end(str: Uint8Array | string, encoding?: string, callback?: () => void): this;
}

declare function response(context: context, options?: options): Response;

export default response;

