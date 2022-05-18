# route

## usage

```ts
import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { BaseController, registerRoutes, route } from "@common-creation/fastify-decorators";

@route("/v1/healthcheck")
class HealthCheck extends BaseController {
  public static async get(req: FastifyRequest<{}>, res: FastifyReply) {
    res.send({
      statusCode: 200,
    });
  }
}

(async () => {
  const f = fastify();
  const routes = [HealthCheck];
  registerRoutes(f, routes);

  await f.listen(3000, "0.0.0.0");
})();
```