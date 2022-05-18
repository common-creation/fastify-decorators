# middleware

## usage

```ts
import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { requestContext } from "fastify-request-context";
import { BaseController, registerRoutes, route, middleware } from "@common-creation/fastify-decorators";

export const isAuthorized = () =>
  middleware(async (req, res, next) => {
    const unAuthorized = (message?: string) => {
      return res.code(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: message || "Authorization header seems missing",
      });
    };
    let user;

    // TODO: check authorize

    user = {};

    if (user) {
      requestContext.set("User", user);
      return next(req, res);
    } else {
      return unAuthorized();
    }
  });

@route("/v1/todo")
class Todo extends BaseController {
  @isAuthorized()
  public static async get(req: FastifyRequest<{}>, res: FastifyReply) {
    res.send({
      statusCode: 200,
    });
  }
}

(async () => {
  const f = fastify();
  const routes = [Todo];
  registerRoutes(f, routes);

  await f.listen(3000, "0.0.0.0");
})();
```