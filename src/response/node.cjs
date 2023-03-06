const fs = require("node:fs");
const path = require("node:path");
const mime = require("mime-types");

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

  attachment(filename = null) {
    if (filename) {
      // Set content type
      this.type(mime.lookup(filename));
      // Set content disposition
      this.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(filename)}"`
      );
    } else {
      // Set content disposition
      this.setHeader("Content-Disposition", "attachment");
    }
    return this;
  },

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
  },

  clearCookie(name, options = {}) {
    this.cookie(name, "", {
      ...options,
      maxAge: -1,
    });
    return this;
  },

  download(path, filename = null) {
    // Set content disposition
    this.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename ? filename : path.basename(path)}"`
    );
    this.sendFile(path, filename);
  },

  get(field) {
    return this.getHeader(field);
  },

  has(field) {
    return this.hasHeader(field);
  },

  header(field, value = null) {
    this.setHeader(field, value);
    return this;
  },

  json(body) {
    this.setHeader("Content-Type", "application/json").end(
      JSON.stringify(body)
    );
  },

  jsonp(body, callback = "callback") {
    this.setHeader("Content-Type", "application/javascript").end(
      `${callback}(${JSON.stringify(body)})`
    );
  },

  links(links) {
    if (typeof links === "object" && !Array.isArray(links) && links !== null) {
      let value = [];
      for (const rel of Object.keys(links)) {
        value.push(`<${links[rel]}>; rel="${rel}"`);
      }
      this.setHeader("Link", value);
    } else {
      throw new TypeError(
        "Error: links function only accepts object as an argument"
      );
    }
    return this;
  },

  location(path) {
    this.setHeader("Location", path);
    return this;
  },

  redirect(path, status = 302) {
    this.status(status).setHeader("Location", path).end();
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

  send(body) {
    this.end(body);
  },

  sendFile(path) {
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
  },

  sendHeader(field, value = null) {
    this.setHeader(field, value).end();
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
            "Error: set function field parameter only accepts string or object as an argument"
          );
        }
      }
    } else {
      throw new TypeError(
        "Error: set function field parameter only accepts string or object as an argument"
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

  type(type) {
    this.setHeader("Content-Type", `${type}`);
    return this;
  },

  vary(field) {
    this.setHeader("Vary", field);
    return this;
  },
};
