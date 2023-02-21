const NodeResponse = require("./response/node.cjs");

module.exports = class Response {
  #req = null;
  res = null;
  locals = {};
  headersSent = null;
  #response = null;
  #config = {};
  #supportedServers = ["node"];

  constructor(req, res, options = {}) {
    this.res = res;
    this.#config = options;
    // Create http response object
    if (
      this.#config.server &&
      (typeof this.#config.server === "string" ||
        this.#config.server instanceof String)
    ) {
      if (!this.#supportedServers.includes(this.#config.server.toLowerCase())) {
        throw new TypeError(`Error: ${this.#config.server} is not supported`);
      }

      if (this.#config.server.toLowerCase() === "node") {
        this.#response = new NodeResponse(req, res, this.#config);
      }
    } else {
      // Create default http response object
      this.#response = new NodeResponse(req, res, this.#config);
    }

    this.locals = this.#response.locals;
    this.headersSent = this.#response.headersSent;
  }

  append(name, value = null) {
    this.#response.append(name, value);
    return this;
  }

  appendHeader(name, value) {
    this.#response.appendHeader(name, value);
    return this;
  }

  attachment(fileName = null) {
    this.#response.attachment(fileName);
    return this;
  }

  cookie(name, value, options = {}) {
    this.#response.cookie(name, value, options);
    return this;
  }

  clearCookie(name, options = {}) {
    this.#response.clearCookie(name, options);
    return this;
  }

  download(filePath, fileName = null) {
    this.#response.download(filePath, fileName);
  }

  end(data, encoding = "utf8") {
    this.#response.end(data, encoding);
  }

  flushHeaders() {
    this.#response.flushHeaders();
    return this;
  }

  get(name) {
    return this.#response.get(name);
  }

  getHeader(name) {
    return this.#response.getHeader(name);
  }

  getHeaders() {
    return this.#response.getHeaders();
  }

  hasHeader(name) {
    return this.#response.hasHeader(name);
  }

  has(name) {
    return this.#response.has(name);
  }

  header(name, value = null) {
    this.#response.header(name, value);
    return this;
  }

  json(body) {
    this.#response.json(body);
  }

  jsonp(body, callback = "callback") {
    this.#response.jsonp(body, callback);
  }

  links(links) {
    this.#response.links(links);
    return this;
  }

  location(path) {
    this.#response.location(path);
    return this;
  }

  redirect(path, status = 302) {
    this.#response.redirect(path, status);
  }

  remove(name) {
    this.#response.remove(name);
    return this;
  }

  removeHeader(name) {
    this.#response.removeHeader(name);
    return this;
  }

  send(body) {
    this.#response.send(body);
  }

  sendFile(filePath, fileName = null) {
    this.#response.sendFile(filePath, fileName);
  }

  sendHeader(name, value = null) {
    this.#response.sendHeader(name, value);
  }

  sendStatus(code, message = null) {
    this.#response.sendStatus(code, message);
  }

  set(name, value = null) {
    this.#response.set(name, value);
    return this;
  }

  setHeader(name, value = null) {
    this.#response.setHeader(name, value);
    return this;
  }

  status(code, message = null) {
    this.#response.status(code, message);
    return this;
  }

  type(type) {
    this.#response.type(type);
    return this;
  }

  vary(name) {
    this.#response.vary(name);
    return this;
  }

  write(chunk, encoding = "utf8") {
    this.#response.write(chunk, encoding);
    return this;
  }
};
