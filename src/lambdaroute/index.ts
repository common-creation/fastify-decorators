import type { FastifyInstance, FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import FindMyWay from "find-my-way";
import { IncomingMessage, ServerResponse } from "http";

export function lambdaroute() {
  return (target: any) => {
    return class extends target {
      public static call(method: HTTPMethods) {
        return target[method.toLowerCase()];
      }
    } as typeof target;
  };
}

export interface IBaseController {
  call(method: HTTPMethods): void;
}

export class BaseController {
  public static call(method: HTTPMethods): void {
  }
}

export type RouteInfo = {[path: string]: () => Promise<{ default: IBaseController}>}

export class LambdaController {
  private server: FastifyInstance;
  private finder: FindMyWay.Instance<FindMyWay.HTTPVersion.V1>;
  private router: FindMyWay.Instance<FindMyWay.HTTPVersion.V1>;
  private routes: RouteInfo;

  public static inject(server: FastifyInstance, routes: RouteInfo) {
    new LambdaController(server, routes);
  }

  private constructor(server: FastifyInstance, routes: RouteInfo) {
    this.server = server;
    this.routes = routes;
    this.finder = FindMyWay();
    this.router = FindMyWay();

    this.registerRoutes();
    this.registerCatchAll();
  }

  private registerCatchAll() {
    this.server.route({
      method: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],
      url: "/*",
      handler: async (request: FastifyRequest, reply: FastifyReply) => {
        const path = (Array.isArray(request.headers[":path"]) ? request.headers[":path"][0] : request.headers[":path"]) || request.raw.url?.split("?")[0] || "";
        const route = this.finder.find("GET", path);
        if (!route) {
          this.sendError(request, reply, `Route ${request.method}:${request.url} not found in LambdaController`);
          return;
        }
        const dummyIncomingMessage = { url: path, method: "GET" };
        route.handler(dummyIncomingMessage as unknown as IncomingMessage, {} as unknown as ServerResponse, {}, {}, {});
        if (!this.router.find(request.method as HTTPMethods, dummyIncomingMessage.url)) {
          const routeInfo = this.routes[dummyIncomingMessage.url];
          const controller: any = (await routeInfo()).default;
          const handler = controller[request.method.toLowerCase()];
          if (handler) {
            this.router.on(request.method as HTTPMethods, dummyIncomingMessage.url, this.wrapHandler(handler));
          }
        }
        this.router.lookup(request as unknown as IncomingMessage, reply as unknown as ServerResponse);
        return reply;
      },
    })
  }

  private registerRoutes() {
    const paths = Object.keys(this.routes);
    for (const path of paths) {
      this.finder.on("GET", path, this.finderHandler(path));
    }
  }

  private finderHandler(path: string) {
    return (request: IncomingMessage, reply: ServerResponse, params: unknown) => {
      request.url = path;
    };
  }

  private wrapHandler(handler: any) {
    return (request: IncomingMessage, reply: ServerResponse, params: unknown) => {
      (request as unknown as FastifyRequest).params = params;
      return handler(request, reply) as FindMyWay.Handler<FindMyWay.HTTPVersion.V1>;
    };
  }

  private sendError(request: FastifyRequest, reply: FastifyReply, message: string) {
    if (request.method !== "HEAD") {
      reply.status(404).send({
        message,
        error: "Not Found",
        statusCode: 404
      });
      return;
    }
    reply.status(404).send();
  }
}
