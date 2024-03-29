const supertest = require("supertest");
const responseWrapper = require("../index.cjs");
const Readable = require("stream").Readable;

describe("Response test", () => {
  test("Set header text/html", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.set("Content-Type", "text/html").end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["content-type"]).toBe("text/html");
      });
  });

  test("Set multiple headers", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.set("Content-Type", "text/html");
      res.set("Set-Cookie", ["a=10", "b=20"]);
      res.end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["content-type"]).toBe("text/html");
        expect(res.header["set-cookie"]).toEqual(["a=10", "b=20"]);
      });
  });

  test("Set multiple headers from object", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res
        .set({
          "Content-Type": "text/html",
          "Set-Cookie": ["a=10", "b=20"],
        })
        .end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["content-type"]).toBe("text/html");
        expect(res.header["set-cookie"]).toEqual(["a=10", "b=20"]);
      });
  });

  test("Append header", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.set("Content-Type", "text/html");
      res.append("Set-Cookie", "a=10; HttpOnly");
      res.append("Set-Cookie", "b=20; HttpOnly");
      res.end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["set-cookie"]).toEqual([
          "a=10; HttpOnly",
          "b=20; HttpOnly",
        ]);
      });
  });

  test("Append multiple headers", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.set("Content-Type", "text/html");
      res.append({ "Set-Cookie": ["a=10; HttpOnly", "b=20; HttpOnly"] });
      res.append("Set-Cookie", ["c=10; HttpOnly", "d=20"]);
      res.end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["set-cookie"]).toEqual([
          "a=10; HttpOnly",
          "b=20; HttpOnly",
          "c=10; HttpOnly",
          "d=20",
        ]);
      });
  });

  test("Remove header", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.set("Content-Type", "text/html");
      res.set("Set-Cookie", ["a=10", "b=20"]);
      res.removeHeader("Set-Cookie");
      res.end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["content-type"]).toBe("text/html");
        expect(res.header["set-cookie"]).toBe(undefined);
      });
  });

  test("Remove multiple header", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.set("Content-Type", "text/html");
      res.set("Set-Cookie", ["a=10", "b=20"]);
      res.removeHeader("Content-Type");
      res.removeHeader("Set-Cookie");
      res.end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["content-type"]).toBe(undefined);
        expect(res.header["set-cookie"]).toBe(undefined);
      });
  });

  test("Get all headers", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.set("Content-Type", "text/html");
      res.set("Set-Cookie", ["a=10", "b=20"]);
      res.end();
      expect(res.getHeaders()).toEqual({
        "content-type": "text/html",
        "set-cookie": ["a=10", "b=20"],
      });
    })
      .get("/")
      .expect(200);
  });

  test("Get single header", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.set("Content-Type", "text/html");
      res.set("Set-Cookie", ["a=10", "b=20"]);
      res.end();
      expect(res.getHeader("content-type")).toBe("text/html");
    })
      .get("/")
      .expect(200);
  });

  test("Set cookie", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.cookie("a", 10);
      res.cookie("b", 20);
      res.end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["set-cookie"]).toEqual(["a=10", "b=20"]);
      });
  });

  test("Delete cookie", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.cookie("a", 10);
      res.cookie("b", 20);
      res.clearCookie("b");
      res.end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["set-cookie"]).toEqual([
          "a=10",
          "b=20",
          "b=; Max-Age=-1",
        ]);
      });
  });

  test("Write Hello, World to body", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.write("Hello");
      res.write(", World");
      res.end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Hello, World");
      });
  });

  test("End method should response with status code 200 with body Ok", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.end("Ok");
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("Send method should response with status code 200 with body Ok", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.send("Ok");
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("Send status method should response with status code 400", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.sendStatus(400);
    })
      .get("/")
      .expect(400);
  });

  test("Set status code 400 and body Ok", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.status(400).send("Ok");
    })
      .get("/")
      .expect(400)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("Send json response", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.json({ a: 10 });
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["content-type"]).toBe("application/json");
        expect(res.text).toEqual(JSON.stringify({ a: 10 }));
      });
  });

  test("Send json response", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.json([{ a: 10 }]);
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["content-type"]).toBe("application/json");
        expect(res.text).toEqual(JSON.stringify([{ a: 10 }]));
      });
  });

  test("Send jsonp response", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.jsonp({ a: 10 }, "test");
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["content-type"]).toBe("text/javascript");
        expect(res.text).toEqual(
          `/**/ typeof test === 'function' && test(${JSON.stringify({
            a: 10,
          })});`
        );
      });
  });

  test("Send header", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.sendHeader("Content-Type", "text/html");
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["content-type"]).toBe("text/html");
      });
  });

  test("Set links header", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res
        .links({
          next: "http://example.com",
          prev: "http://example.com",
        })
        .end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["link"]).toBe(
          '<http://example.com>; rel="next", <http://example.com>; rel="prev"'
        );
      });
  });

  test("Set vary header", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.vary("Content-Type").end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["vary"]).toBe("Content-Type");
      });
  });

  test("Set multiple vary header from array", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.vary(["Content-Type", "Accept"]).end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["vary"]).toBe("Content-Type, Accept");
      });
  });

  test("Set multiple vary header", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.vary("Content-Type").vary("Accept").end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["vary"]).toBe("Content-Type, Accept");
      });
  });

  test("Redirect response", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      res.redirect("http://example.com");
    })
      .get("/")
      .expect(302)
      .then((res) => {
        expect(res.header["location"]).toBe("http://example.com");
      });
  });

  test("Pipe response", async () => {
    await supertest(function (req, res) {
      res = responseWrapper({ res });
      const s = new Readable();
      s.push("Ok");
      s.push(null);
      s.pipe(res);
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toEqual("Ok");
      });
  });
});
