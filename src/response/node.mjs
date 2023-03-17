import fs from "node:fs";
import mime from "mime-types";
import contentDisposition from "content-disposition";
import cookie from "cookie";
import statuses from "statuses";

export default function ({ req, res }, options = {}) {
  Object.defineProperties(res, {
    append: {
      value: function (field, value = null) {
        if (!field) {
          throw new TypeError(
            "Error: append function field parameter only accepts string or object as an argument"
          );
        }

        if (typeof field === "string" || field instanceof String) {
          const prev = this.get(field);
          if (prev) {
            value = Array.isArray(prev)
              ? prev.concat(value)
              : [prev].concat(value);
          }
          return this.set(field, value);
        } else if (Array.isArray(field) === false) {
          for (const key of Object.keys(field)) {
            if (typeof key === "string" || key instanceof String) {
              const prev = this.get(key);
              if (prev) {
                value = Array.isArray(prev)
                  ? prev.concat(field[key])
                  : [prev].concat(field[key]);
              }
              return this.set(key, field[key]);
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
      },
    },

    attachment: {
      value: function (filename) {
        if (filename) {
          // Set content type
          this.type(mime.lookup(filename));
        }
        // Set content disposition
        return this.set("Content-Disposition", contentDisposition(filename));
      },
    },

    contentType: {
      value: function (type, charset = "utf-8") {
        return this.type(type, charset);
      },
    },

    cookie: {
      value: function (name, value, options = {}) {
        return this.append(
          "Set-Cookie",
          cookie.serialize(name, String(value), options)
        );
      },
    },

    clearCookie: {
      value: function (name, options = {}) {
        return this.cookie(name, "", {
          ...options,
          maxAge: -1,
        });
      },
    },

    download: {
      value: function (path, filename = null, callback = null) {
        if (
          !(
            typeof filename === "function" ||
            typeof filname === "string" ||
            filename instanceof String
          )
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

        this.sendFile(
          path,
          typeof filename === "function" ? filename : callback
        );
      },
    },

    get: {
      value: function (field) {
        return this.getHeader(field);
      },
    },

    has: {
      value: function (field) {
        return this.hasHeader(field);
      },
    },

    header: {
      value: function (field, value = null) {
        return this.set(field, value);
      },
    },

    json: {
      value: function (body) {
        this.set("Content-Type", "application/json").send(JSON.stringify(body));
      },
    },

    jsonp: {
      value: function (body, callback = "callback") {
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
          body = body
            .replace(/\u2028/g, "\\u2028")
            .replace(/\u2029/g, "\\u2029");
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
    },

    links: {
      value: function (links) {
        if (
          typeof links === "object" &&
          !Array.isArray(links) &&
          links !== null
        ) {
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
    },

    location: {
      value: function (url) {
        if (url === "back") {
          url = this.req.get("Referrer") || "/";
        }

        return this.set("Location", encodeURI(url));
      },
    },

    redirect: {
      value: function (url, status = 302) {
        if (url === "back") {
          url = this.req.get("Referrer") || "/";
        }

        // Set location header
        this.location(url);

        // Set redirection body
        this.status(status).end(
          statuses.message[status] + ". Redirecting to " + url
        );
      },
    },

    remove: {
      value: function (field) {
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
    },

    send: {
      value: function (body, charset = "utf-8") {
        // Set content body, content type and content length
        switch (typeof body) {
          case "string":
            if (!this.get("Content-Type")) {
              this.type("html", charset);
            }
            this.set("Content-Length", Buffer.byteLength(body));
            break;
          case "boolean":
          case "number":
          case "object":
            if (body === null) {
              this.status(204);
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
        if (this.statusCode === 204) {
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
    },

    sendFile: {
      value: function (path, callback = null) {
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
    },

    sendHeader: {
      value: function (field, value = null) {
        this.set(field, value).end();
      },
    },

    sendStatus: {
      value: function (code, message = null) {
        this.statusCode = code;
        if (message) {
          this.statusMessage = message;
        }
        this.end();
      },
    },

    set: {
      value: function (field, value = null) {
        if (!field) {
          throw new TypeError(
            "Error: set header function field parameter only accepts string or object as an argument"
          );
        }

        if (typeof field === "string" || field instanceof String) {
          this.setHeader(field, value);
        } else if (Array.isArray(field) === false) {
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
    },

    status: {
      value: function (code, message = null) {
        this.statusCode = code;
        if (message) {
          this.statusMessage = message;
        }
        return this;
      },
    },

    type: {
      value: function (type, charset = "utf-8") {
        return this.set(
          "Content-Type",
          `${
            type.indexOf("/") === -1 ? mime.lookup(type) : type
          }; charset=${charset}`
        );
      },
    },

    vary: {
      value: function (field) {
        return this.append("Vary", field);
      },
    },
  });
  return res;
}
