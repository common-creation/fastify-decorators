import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import { route, BaseController, registerRoutes } from ".";

@route("/")
class RootController extends BaseController {
  public static async get(req: FastifyRequest, res: FastifyReply) {
    res.status(410).send();
  }
  public static async post(req: FastifyRequest, res: FastifyReply) {
    res.status(411).send();
  }
  public static async put(req: FastifyRequest, res: FastifyReply) {
    res.status(412).send();
  }
  public static async patch(req: FastifyRequest, res: FastifyReply) {
    res.status(413).send();
  }
  public static async delete(req: FastifyRequest, res: FastifyReply) {
    res.status(414).send();
  }
  public static async head(req: FastifyRequest, res: FastifyReply) {
    res.status(415).send();
  }
}

@route("/path/to/some/endpoint")
class SomeController extends BaseController {
  public static async get(req: FastifyRequest, res: FastifyReply) {
    res.status(510).send();
  }
  public static async post(req: FastifyRequest, res: FastifyReply) {
    res.status(511).send();
  }
  public static async put(req: FastifyRequest, res: FastifyReply) {
    res.status(512).send();
  }
  public static async patch(req: FastifyRequest, res: FastifyReply) {
    res.status(513).send();
  }
  public static async delete(req: FastifyRequest, res: FastifyReply) {
    res.status(514).send();
  }
  public static async head(req: FastifyRequest, res: FastifyReply) {
    res.status(515).send();
  }
}

interface TestCases {
  [key: string]: {
    url: string;
    expects: Expect[];
  };
}
type Expect = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD";
  status: number;
};

const testCases: TestCases = {
  root: {
    url: "/",
    expects: [
      {
        method: "GET",
        status: 410,
      },
      {
        method: "POST",
        status: 411,
      },
      {
        method: "PUT",
        status: 412,
      },
      {
        method: "PATCH",
        status: 413,
      },
      {
        method: "DELETE",
        status: 414,
      },
      {
        method: "HEAD",
        status: 415,
      },
    ],
  },
  some: {
    url: "/path/to/some/endpoint",
    expects: [
      {
        method: "GET",
        status: 510,
      },
      {
        method: "POST",
        status: 511,
      },
      {
        method: "PUT",
        status: 512,
      },
      {
        method: "PATCH",
        status: 513,
      },
      {
        method: "DELETE",
        status: 514,
      },
      {
        method: "HEAD",
        status: 515,
      },
    ],
  },
  invalid: {
    url: "/path/to/invalid/endpoint",
    expects: [
      {
        method: "GET",
        status: 404,
      },
      {
        method: "POST",
        status: 404,
      },
      {
        method: "PUT",
        status: 404,
      },
      {
        method: "PATCH",
        status: 404,
      },
      {
        method: "DELETE",
        status: 404,
      },
      {
        method: "HEAD",
        status: 404,
      },
    ],
  },
};

describe("route", () => {
  describe("route without prefix", () => {
    const fastify = Fastify();
    registerRoutes(fastify, [RootController, SomeController]);

    for (const targetCaseKeys of Object.keys(testCases)) {
      const targetCase = testCases[targetCaseKeys];
      const url = targetCase.url;
      for (const testCase of targetCase.expects) {
        test(`${testCase.method} ${url}`, async () => {
          const response = await fastify.inject({
            url: url,
            method: testCase.method,
          });
          expect(response.statusCode).toBe(testCase.status);
        });
      }
    }
  });

  describe("route with prefix", () => {
    const fastify = Fastify();
    registerRoutes(fastify, [RootController, SomeController], "api");

    for (const targetCaseKeys of Object.keys(testCases)) {
      const targetCase = testCases[targetCaseKeys];
      const url = "/api" + targetCase.url;
      for (const testCase of targetCase.expects) {
        test(`${testCase.method} ${url}`, async () => {
          const response = await fastify.inject({
            url,
            method: testCase.method,
          });
          expect(response.statusCode).toBe(testCase.status);
        });
      }
    }
  });

  describe("route with prefix with trailing slash", () => {
    const fastify = Fastify();
    registerRoutes(fastify, [RootController, SomeController], "api/");

    for (const targetCaseKeys of Object.keys(testCases)) {
      const targetCase = testCases[targetCaseKeys];
      const url = "/api" + targetCase.url;
      for (const testCase of targetCase.expects) {
        test(`${testCase.method} ${url}`, async () => {
          const response = await fastify.inject({
            url,
            method: testCase.method,
          });
          expect(response.statusCode).toBe(testCase.status);
        });
      }
    }
  });
});
