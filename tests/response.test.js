const request = require("supertest");
const { Response } = require("../index.cjs");

describe("Response test", () => {
  test("Set header text/html", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.setHeader("Content-Type", "text/html").end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["content-type"]).toBe("text/html");
      });
  });

  test("Set multiple headers", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.setHeader("Content-Type", "text/html");
      response.setHeader("Set-Cookie", ["a=10", "b=20"]);
      response.end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["content-type"]).toBe("text/html");
        expect(res.header["set-cookie"]).toEqual(["a=10", "b=20"]);
      });
  });

  test("Set multiple headers from object", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response
        .setHeader({
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
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.setHeader("Content-Type", "text/html");
      response.append("Set-Cookie", "a=10; HttpOnly");
      response.append("Set-Cookie", "b=20; HttpOnly");
      response.end();
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
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.setHeader("Content-Type", "text/html");
      response.append({ "Set-Cookie": ["a=10; HttpOnly", "b=20; HttpOnly"] });
      response.append("Set-Cookie", ["c=10; HttpOnly", "d=20"]);
      response.end();
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
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.setHeader("Content-Type", "text/html");
      response.setHeader("Set-Cookie", ["a=10", "b=20"]);
      response.removeHeader("Set-Cookie");
      response.end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["content-type"]).toBe("text/html");
        expect(res.header["set-cookie"]).toBe(undefined);
      });
  });

  test("Remove multiple header", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.setHeader("Content-Type", "text/html");
      response.setHeader("Set-Cookie", ["a=10", "b=20"]);
      response.removeHeader("Content-Type");
      response.removeHeader("Set-Cookie");
      response.end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["content-type"]).toBe(undefined);
        expect(res.header["set-cookie"]).toBe(undefined);
      });
  });

  test("Get all headers", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.setHeader("Content-Type", "text/html");
      response.setHeader("Set-Cookie", ["a=10", "b=20"]);
      response.end();
      expect(response.getHeaders()).toEqual({
        "content-type": "text/html",
        "set-cookie": ["a=10", "b=20"],
      });
    })
      .get("/")
      .expect(200);
  });

  test("Get single header", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.setHeader("Content-Type", "text/html");
      response.setHeader("Set-Cookie", ["a=10", "b=20"]);
      response.end();
      expect(response.getHeader("content-type")).toBe("text/html");
    })
      .get("/")
      .expect(200);
  });

  test("Set cookie", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.cookie("a", 10);
      response.cookie("b", 20);
      response.end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["set-cookie"]).toEqual(["a=10", "b=20"]);
      });
  });

  test("Delete cookie", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.cookie("a", 10);
      response.cookie("b", 20);
      response.clearCookie("b");
      response.end();
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
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.write("Hello");
      response.write(", World").end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Hello, World");
      });
  });

  test("End method should response with status code 200 with body Ok", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.end("Ok");
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("Send method should response with status code 200 with body Ok", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.send("Ok");
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("Send status method should response with status code 400", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.sendStatus(400);
    })
      .get("/")
      .expect(400);
  });

  test("Set status code 400 and body Ok", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.status(400).send("Ok");
    })
      .get("/")
      .expect(400)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("Send json response", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.json({ a: 10 });
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["content-type"]).toBe("application/json");
        expect(res.text).toEqual(JSON.stringify({ a: 10 }));
      });
  });

  test("Send json response", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.json([{ a: 10 }]);
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["content-type"]).toBe("application/json");
        expect(res.text).toEqual(JSON.stringify([{ a: 10 }]));
      });
  });

  test("Send jsonp response", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.jsonp({ a: 10 }, "test");
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["content-type"]).toBe("application/javascript");
        expect(res.text).toEqual(`test(${JSON.stringify({ a: 10 })})`);
      });
  });

  test("Send header", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.sendHeader("Content-Type", "text/html");
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["content-type"]).toBe("text/html");
      });
  });

  test("Set links header", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response
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
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.vary(["Content-Type", "Accept"]).end();
    })
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.header["vary"]).toBe("Content-Type, Accept");
      });
  });

  test("Redirect response", async () => {
    await request(function (req, res) {
      const response = new Response({ req: req, res: res });
      response.redirect("http://example.com");
    })
      .get("/")
      .expect(302)
      .then((res) => {
        expect(res.header["location"]).toBe("http://example.com");
      });
  });
});
