import type { FastifyInstance } from "fastify";
import { default as nodePath } from "path";

let _prefix = "";

/**
 * @deprecated use registerRoutes params. 
 */
export function setPrefix(prefix: string) {
  _prefix = prefix || "";
}

export function route(path: string) {
  return (target: any) => {
    return class extends target {
      public static register(server: FastifyInstance, opts: { internalPrefix: string }, next: () => void): void {
        const internalPrefix = opts.internalPrefix || _prefix;
        const normalizedPath = nodePath.posix.join("/", internalPrefix, path);

        if (target.get) {
          server.log.trace({ method: "GET", path: normalizedPath, func: `${target.name}.get` }, "register route");
          server.get(normalizedPath, target.get);
        }
        if (target.post) {
          server.log.trace({ method: "POST", path: normalizedPath, func: `${target.name}.post` }, "register route");
          server.post(normalizedPath, target.post);
        }
        if (target.put) {
          server.log.trace({ method: "PUT", path: normalizedPath, func: `${target.name}.put` }, "register route");
          server.put(normalizedPath, target.put);
        }
        if (target.delete) {
          server.log.trace({ method: "DELETE", path: normalizedPath, func: `${target.name}.delete` }, "register route");
          server.delete(normalizedPath, target.delete);
        }
        if (target.head) {
          server.log.trace({ method: "HEAD", path: normalizedPath, func: `${target.name}.head` }, "register route");
          server.head(normalizedPath, target.head);
        }
        if (target.patch) {
          server.log.trace({ method: "PATCH", path: normalizedPath, func: `${target.name}.patch` }, "register route");
          server.patch(normalizedPath, target.patch);
        }

        next();
      }
    } as typeof target;
  };
}

export interface IBaseController {
  register(server: FastifyInstance, opts: any, next: () => void): void;
}

export class BaseController {
  public static register(server: FastifyInstance, opts: any, next: () => void): void {
    next();
  }
}

export function registerRoutes(server: FastifyInstance, routes: IBaseController[], prefix?: string) {
  routes.forEach((route) => {
    server.register(route.register, {
      internalPrefix: prefix || "",
    });
  });
}
