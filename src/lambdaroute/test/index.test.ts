import type { APIGatewayEvent } from "aws-lambda";
import Fastify from "fastify";
import { LambdaController } from "..";

interface TestCases {
  [key: string]: {
    url: string;
    injectUrl: string;
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
    injectUrl: "/",
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
    injectUrl: "/path/to/some/endpoint",
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
  params: {
    url: "/path/to/some/endpoint/with/:params",
    injectUrl: "/path/to/some/endpoint/with/param1",
    expects: [
      {
        method: "GET",
        status: 200,
      },
    ],
  },
  wildcard: {
    url: "/path/to/some/wildcard/endpoint/with/*",
    injectUrl: "/path/to/some/wildcard/endpoint/with/wild/card",
    expects: [
      {
        method: "GET",
        status: 200,
      },
    ],
  },
  middleware: {
    url: "/path/to/middleware",
    injectUrl: "/path/to/middleware",
    expects: [
      {
        method: "GET",
        status: 200,
      },
    ],
  },
  invalid: {
    url: "/path/to/invalid/endpoint",
    injectUrl: "/path/to/invalid/endpoint",
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
    const fastify = Fastify({
      exposeHeadRoutes: false,
    });

    const controllers = {
      [testCases.root.url]: () => import("./controllers/RootController"),
      [testCases.some.url]: () => import("./controllers/SomeController"),
      [testCases.wildcard.url]: () => import("./controllers/WildcardController"),
      [testCases.middleware.url]: () => import("./controllers/MiddlewareController"),
      [testCases.params.url]: () => import("./controllers/ParamsController"),
    };

    LambdaController.inject(fastify, controllers);

    for (const targetCaseKeys of Object.keys(testCases)) {
      const targetCase = testCases[targetCaseKeys];
      const { url, injectUrl } = targetCase;
      for (const testCase of targetCase.expects) {
        test(`${testCase.method} ${url} <- ${injectUrl}`, async () => {
          const response = await fastify.inject({
            url: injectUrl,
            method: testCase.method,
          });
          if (response.statusCode !== testCase.status) {
            console.log(response.body);
          }
          expect(response.statusCode).toBe(testCase.status);
        });
      }
    }
  });
});
