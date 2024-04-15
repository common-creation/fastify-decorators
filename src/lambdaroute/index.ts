import type { APIGatewayEvent } from "aws-lambda";
import type { FastifyInstance, FastifyReply, FastifyRequest, HTTPMethods, RouteHandlerMethod } from "fastify";
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

export class LambdaController {
  private router: FindMyWay.Instance<FindMyWay.HTTPVersion.V1>;

  constructor(server: FastifyInstance) {
    this.router = FindMyWay();

    this.registerCatchAll(server);
  }

  private registerCatchAll(server: FastifyInstance) {
    server.route({
      method: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      url: "/*",
      handler: async (request: FastifyRequest, reply: FastifyReply) => {
        const path = (Array.isArray(request.headers[":path"]) ? request.headers[":path"][0] : request.headers[":path"]) || request.raw.url?.split("?")[0] || "";
        if (!this.router.find(request.method as HTTPMethods, path)) {
          reply.status(404).send({
            message:`Route ${request.method}:${request.url} not found in LambdaController`,
            error: "Not Found",
            statusCode: 404
          });
          return;
        }
        this.router.lookup(request.raw as unknown as IncomingMessage, reply as unknown as ServerResponse);
      },
    })
  }

  private wrapHandler(handler: any) {
    return (request: IncomingMessage, reply: ServerResponse, params: unknown) => {
      (request as unknown as FastifyRequest).params = params;
      return handler(request, reply) as FindMyWay.Handler<FindMyWay.HTTPVersion.V1>;
    };
  }

  public async registerRoutes(routes: {[path: string]: Promise<{ default: IBaseController}>}, event: APIGatewayEvent) {
    if (this.router.find(event.httpMethod as HTTPMethods, event.path)) {
      return;
    }
    for (const route of Object.keys(routes).filter(path => path === event.path)) {
      const controller: any = (await routes[route]).default;
      const handler = controller[event.httpMethod.toLowerCase()];
      if (handler) {
        this.router.on(event.httpMethod as HTTPMethods, route, this.wrapHandler(handler));
      }
    }
  }
}

