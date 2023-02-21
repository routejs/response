const fs = require("node:fs");
const path = require("node:path");
const mime = require("mime-types");

module.exports = class Response {
  res = null;
  headersSent = null;
  locals = null;
  #req = null;
  #config = {};

  constructor(context, options = {}) {
    this.res = context.res;
    this.#req = context.req;
    this.#config = options;

    this.headersSent = this.res.headersSent;
  }

  append(name, value = null) {
    this.appendHeader(name, value);
    return this;
  }

  appendHeader(name, value) {
    if (typeof name === "string" || name instanceof String) {
      this.res.appendHeader(name, value);
    } else if (!!name && Array.isArray(name) === false) {
      for (const key of Object.keys(name)) {
        if (typeof key === "string" || key instanceof String) {
          this.res.appendHeader(key, name[key]);
        } else {
          throw new TypeError(
            "Error: appendHeader function name parameter only accepts string or object as an argument"
          );
        }
      }
    } else {
      throw new TypeError(
        "Error: appendHeader function name parameter only accepts string or object as an argument"
      );
    }
    return this;
  }

  attachment(fileName = null) {
    if (fileName) {
      // Set content type
      this.type(mime.lookup(fileName));
      // Set content disposition
      this.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(fileName)}"`
      );
    } else {
      // Set content disposition
      this.setHeader("Content-Disposition", "attachment");
    }
    return this;
  }

  cookie(name, value, options = {}) {
    const {
      domain,
      expires,
      httpOnly,
      maxAge,
      path,
      priority,
      secure,
      partitioned,
      sameSite,
    } = options;
    let cookieAttributes = `${name}=${value}`;
    if (domain) {
      cookieAttributes += `; Domain=${domain}`;
    }
    if (expires) {
      cookieAttributes += `; Expires=${expires}`;
    }
    if (httpOnly) {
      cookieAttributes += `; HttpOnly`;
    }
    if (maxAge) {
      cookieAttributes += `; Max-Age=${maxAge}`;
    }
    if (path) {
      cookieAttributes += `; Path=${path}`;
    }
    if (priority) {
      cookieAttributes += `; Priority=${priority}`;
    }
    if (secure) {
      cookieAttributes += `; Secure`;
    }
    if (partitioned) {
      cookieAttributes += `; Partitioned`;
    }
    if (sameSite) {
      cookieAttributes += `; SameSite=${sameSite}`;
    }
    this.append("Set-Cookie", cookieAttributes);
    return this;
  }

  clearCookie(name, options = {}) {
    this.cookie(name, "", {
      ...options,
      maxAge: -1,
    });
    return this;
  }

  download(filePath, fileName = null) {
    // Set content disposition
    this.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName ? fileName : path.basename(filePath)}"`
    );
    this.sendFile(filePath, fileName);
  }

  end(data, encoding = "utf8") {
    this.res.end(data, encoding);
  }

  flushHeaders() {
    this.res.flushHeaders();
    return this;
  }

  get(name) {
    return this.getHeader(name);
  }

  getHeader(name) {
    return this.res.getHeader(name);
  }

  getHeaders() {
    return this.res.getHeaders();
  }

  hasHeader(name) {
    return this.res.hasHeader(name);
  }

  has(name) {
    return this.hasHeader(name);
  }

  header(name, value = null) {
    this.setHeader(name, value);
    return this;
  }

  json(body) {
    this.setHeader("Content-Type", ["application/json"]).end(
      JSON.stringify(body)
    );
  }

  jsonp(body, callback = "callback") {
    this.setHeader("Content-Type", ["application/javascript"]).end(
      `${callback}(${JSON.stringify(body)})`
    );
  }

  links(links) {
    if (typeof links === "object" && !Array.isArray(links) && links !== null) {
      let value = [];
      for (const key of Object.keys(links)) {
        value.push(`<${links[key]}>; rel="${key}"`);
      }
      this.setHeader("Link", value);
    } else {
      throw new TypeError(
        "Error: links function only accepts object as an argument"
      );
    }
    return this;
  }

  location(path) {
    this.setHeader("Location", path);
    return this;
  }

  redirect(path, status = 302) {
    this.status(status).setHeader("Location", path).end();
  }

  remove(name) {
    this.removeHeader(name);
    return this;
  }

  removeHeader(name) {
    if (typeof name === "string" || name instanceof String) {
      this.res.removeHeader(name);
    } else if (Array.isArray(name)) {
      name.forEach((key) => {
        if (typeof key === "string" || key instanceof String) {
          this.res.removeHeader(key);
        } else {
          throw new TypeError(
            "Error: removeHeader function name parameter only accepts string or array of string as an argument"
          );
        }
      });
    } else {
      throw new TypeError(
        "Error: removeHeader function name parameter only accepts string or array of string as an argument"
      );
    }
    return this;
  }

  send(body) {
    this.end(body);
  }

  sendFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw Error(`Error: file ${filePath} does not exists`);
    }

    // Set content type
    this.type(mime.lookup(filePath));

    // Set content length if file exists
    const fileStat = fs.statSync(filePath);
    this.setHeader("Content-Length", fileStat.size);

    const stream = fs.createReadStream(filePath);
    stream.pipe(this.res);
  }

  sendHeader(name, value = null) {
    this.setHeader(name, value).end();
  }

  sendStatus(code, message = null) {
    this.res.statusCode = code;
    if (message) {
      this.res.statusMessage = message;
    }
    this.end();
  }

  set(name, value = null) {
    this.setHeader(name, value);
    return this;
  }

  setHeader(name, value = null) {
    if (typeof name === "string" || name instanceof String) {
      this.res.setHeader(name, value);
    } else if (!!name && Array.isArray(name) === false) {
      for (const key of Object.keys(name)) {
        if (typeof key === "string" || key instanceof String) {
          this.res.setHeader(key, name[key]);
        } else {
          throw new TypeError(
            "Error: setHeader function name parameter only accepts string or object as an argument"
          );
        }
      }
    } else {
      throw new TypeError(
        "Error: setHeader function name parameter only accepts string or object as an argument"
      );
    }
    return this;
  }

  status(code, message = null) {
    this.res.statusCode = code;
    if (message) {
      this.res.statusMessage = message;
    }
    return this;
  }

  type(type) {
    this.setHeader("Content-Type", `${type}`);
    return this;
  }

  vary(name) {
    this.setHeader("Vary", name);
    return this;
  }

  write(chunk, encoding = "utf8") {
    this.res.write(chunk, encoding);
    return this;
  }
};
