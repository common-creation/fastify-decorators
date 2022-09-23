import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import { route, BaseController, registerRoutes } from "../route";
import { middleware } from ".";

const skipProcess = (statusCode: number) => middleware((req, res, next) => {
  res.status(statusCode).send();
  return;
});

const noop = () => middleware((req, res, next) => {
  next(req, res);
});


@route("/with/middleware")
class WithMiddlewareController extends BaseController {
  @skipProcess(200)
  public static async get(req: FastifyRequest, res: FastifyReply) {
    res.status(400).send();
  }

  @noop()
  public static async post(req: FastifyRequest, res: FastifyReply) {
    res.status(401).send();
  }
}

@route("/without/middleware")
class WithoutMiddlewareController extends BaseController {
  public static async get(req: FastifyRequest, res: FastifyReply) {
    res.status(410).send();
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
  withMiddleware: {
    url: "/with/middleware",
    expects: [
      {
        method: "GET",
        status: 200,
      },
      {
        method: "POST",
        status: 401,
      },
    ],
  },
  withoutMiddleware: {
    url: "/without/middleware",
    expects: [
      {
        method: "GET",
        status: 410,
      },
    ],
  },
};

describe("middleware", () => {
  const fastify = Fastify();
  registerRoutes(fastify, [WithMiddlewareController, WithoutMiddlewareController]);

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
