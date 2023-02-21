declare interface context {
  req: object;
  res: object;
}

declare interface options {
  server: string;
}

declare type HeaderValue = number | string | string[];

export declare class Response {
  res: object;
  locals: object;
  headersSent: boolean;

  constructor(context: context, options?: options);

  append(name: string, value?: HeaderValue): this;
  appendHeader(name: string, value?: HeaderValue): this;
  attachment(fileName?: string): this;
  cookie(
    name: string,
    value?: number | string,
    options?: {
      domain?: string;
      expires?: string;
      httpOnly?: string;
      maxAge?: string;
      path?: string;
      priority?: string;
      secure?: string;
      partitioned?: string;
      sameSite?: string;
    }
  ): this;
  download(filePath: string, fileName?: string): void;
  end(data: any, encoding?: string): void;
  flushHeaders(): this;
  get(name: string): any;
  getHeader(name: string): any;
  getHeaders(): any;
  hasHeader(name: string): boolean;
  has(name: string): boolean;
  header(name: string, value?: HeaderValue): this;
  json(body: any): void;
  jsonp(body: any, callback?: string): void;
  links(links: object): this;
  location(path: string): this;
  redirect(path: string, status?: number): void;
  remove(name: string): this;
  removeHeader(name: string): this;
  send(body: any): void;
  sendFile(filePath: string): void;
  sendHeader(name: string, value?: HeaderValue): void;
  sendStatus(code: number, message?: string): void;
  set(name: string, value?: HeaderValue): this;
  setHeader(name: string, value?: HeaderValue): this;
  status(code: number, message?: string): this;
  type(type: string): this;
  vary(name: string): this;
  write(chunk: string | Buffer | Uint8Array, encoding?: string): this;
}
