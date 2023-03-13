const fs = require("node:fs");
const mime = require("mime-types");
const contentDisposition = require("content-disposition");
const cookie = require("cookie");
const statuses = require("statuses");

module.exports = {
  append(field, value = null) {
    if (typeof field === "string" || field instanceof String) {
      this.appendHeader(field, value);
    } else if (!!field && Array.isArray(field) === false) {
      for (const key of Object.keys(field)) {
        if (typeof key === "string" || key instanceof String) {
          this.appendHeader(key, field[key]);
        } else {
          throw new TypeError(
            "Error: append function field parameter only accepts string or object as an argument"
          );
        }
      }
    } else {
      throw new TypeError(
        "Error: append function field parameter only accepts string or object as an argument"
      );
    }
    return this;
  },

  attachment(filename) {
    if (filename) {
      // Set content type
      this.type(mime.lookup(filename));
    }
    // Set content disposition
    this.set("Content-Disposition", contentDisposition(filename));
    return this;
  },

  contentType(type, charset = "utf-8") {
    return this.type(type, charset);
  },

  cookie(name, value, options = {}) {
    this.append("Set-Cookie", cookie.serialize(name, String(value), options));
    return this;
  },

  clearCookie(name, options = {}) {
    this.cookie(name, "", {
      ...options,
      maxAge: -1,
    });
    return this;
  },

  download(path, filename = null, callback = null) {
    if (
      typeof filename === "function" ||
      typeof filname === "string" ||
      filename instanceof String
    ) {
      throw TypeError(
        "Error: download function filename parameter only accepts string as an argument"
      );
    }

    // Set content disposition
    this.set(
      "Content-Disposition",
      contentDisposition(
        typeof filname === "string" || filename instanceof String
          ? filename
          : path
      )
    );

    this.sendFile(path, typeof filename === "function" ? filename : callback);
  },

  get(field) {
    return this.getHeader(field);
  },

  has(field) {
    return this.hasHeader(field);
  },

  header(field, value = null) {
    return this.set(field, value);
  },

  json(body) {
    this.set("Content-Type", "application/json").send(JSON.stringify(body));
  },

  jsonp(body, callback = "callback") {
    // Set header jsonp response
    if (!this.get("Content-Type")) {
      this.set("X-Content-Type-Options", "nosniff");
      this.set("Content-Type", "application/json");
    }

    if (typeof callback === "string" && callback.length !== 0) {
      this.set("X-Content-Type-Options", "nosniff");
      this.set("Content-Type", "text/javascript");
    }

    if (body === undefined) {
      // empty argument
      body = "";
    } else if (typeof body === "string") {
      // Replace chars not allowed in JavaScript but allowed in JSON
      body = body.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }

    // Append /**/ to avoid Rosetta Flash JSONP abuse
    this.send(
      "/**/ typeof " +
        callback +
        " === 'function' && " +
        callback +
        "(" +
        JSON.stringify(body) +
        ");"
    );
  },

  links(links) {
    if (typeof links === "object" && !Array.isArray(links) && links !== null) {
      var link = this.get("Link") || "";
      if (link) link += ", ";
      this.set(
        "Link",
        link +
          Object.keys(links)
            .map(function (rel) {
              return "<" + links[rel] + '>; rel="' + rel + '"';
            })
            .join(", ")
      );
    } else {
      throw new TypeError(
        "Error: links function only accepts object as an argument"
      );
    }
    return this;
  },

  location(url) {
    if (url === "back") {
      url = this.req.get("Referrer") || "/";
    }

    return this.set("Location", url);
  },

  redirect(url, status = 302) {
    // Set location header
    this.location(url);

    // Set redirection body
    this.status(status)
      .set("Location", url)
      .end(statuses.message[status] + ". Redirecting to " + url);
  },

  remove(field) {
    if (typeof field === "string" || field instanceof String) {
      this.removeHeader(field);
    } else if (Array.isArray(field)) {
      field.forEach((key) => {
        if (typeof key === "string" || key instanceof String) {
          this.removeHeader(key);
        } else {
          throw new TypeError(
            "Error: remove function field parameter only accepts string or array of string as an argument"
          );
        }
      });
    } else {
      throw new TypeError(
        "Error: remove function field parameter only accepts string or array of string as an argument"
      );
    }
    return this;
  },

  send(body, charset = "utf-8") {
    // Set content body, content type and content length
    switch (typeof body) {
      case "string":
        if (!this.get("Content-Type")) {
          this.type("html", charset);
        }
        break;
      case "boolean":
      case "number":
      case "object":
        if (body === null) {
          body = "";
        } else if (Buffer.isBuffer(body)) {
          if (!this.get("Content-Type")) {
            this.type("bin", charset);
          }
          this.set("Content-Length", body.length);
        } else {
          // Send json response
          return this.json(body);
        }
        break;
      default:
        body = Buffer.from(body);
        this.set("Content-Length", body.length);
        break;
    }

    // Alter header
    if (this.statusCode === 204 || this.statusCode === 304) {
      this.remove("Content-Type");
      this.remove("Content-Length");
      this.remove("Transfer-Encoding");
      body = "";
    }

    if (this.statusCode === 205) {
      this.set("Content-Length", "0");
      this.remove("Transfer-Encoding");
      body = "";
    }

    if (this.req.method?.toUpperCase() === "HEAD") {
      // Skip response body for HEAD request
      this.end();
    } else {
      this.end(body, charset);
    }
  },

  sendFile(path, callback = null) {
    try {
      if (!fs.existsSync(path)) {
        throw Error(`Error: file ${path} does not exists`);
      }

      // Set content type
      this.type(mime.lookup(path));

      // Set content length if file exists
      const fileStat = fs.statSync(path);
      this.setHeader("Content-Length", fileStat.size);

      const stream = fs.createReadStream(path);
      stream.pipe(this);
    } catch (err) {
      if (typeof callback === "function") {
        callback(err);
        return;
      }
      throw err;
    }
  },

  sendHeader(field, value = null) {
    this.set(field, value).end();
  },

  sendStatus(code, message = null) {
    this.statusCode = code;
    if (message) {
      this.statusMessage = message;
    }
    this.end();
  },

  set(field, value = null) {
    if (typeof field === "string" || field instanceof String) {
      this.setHeader(field, value);
    } else if (!!field && Array.isArray(field) === false) {
      for (const key of Object.keys(field)) {
        if (typeof key === "string" || key instanceof String) {
          this.setHeader(key, field[key]);
        } else {
          throw new TypeError(
            "Error: set header function field parameter only accepts string or object as an argument"
          );
        }
      }
    } else {
      throw new TypeError(
        "Error: set header function field parameter only accepts string or object as an argument"
      );
    }
    return this;
  },

  status(code, message = null) {
    this.statusCode = code;
    if (message) {
      this.statusMessage = message;
    }
    return this;
  },

  type(type, charset = "utf-8") {
    this.set(
      "Content-Type",
      `${
        type.indexOf("/") === -1 ? mime.lookup(type) : type
      }; charset=${charset}`
    );
    return this;
  },

  vary(field) {
    return this.append("Vary", field);
  },
};
