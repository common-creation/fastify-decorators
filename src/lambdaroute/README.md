# lambdaroute

## usage

```ts
import { BaseController, lambdaroute } from "@common-creation/fastify-decorators";
import type { FastifyReply, FastifyRequest } from "fastify";

@lambdaroute()
export default class RootController extends BaseController {
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
```

```ts
import { BaseController, registerRoutes, route } from "@common-creation/fastify-decorators";
import awsLambdaFastify from "@fastify/aws-lambda";
import fastify, { FastifyReply, FastifyRequest } from "fastify";

let lambda: any;
let lambdaController: LambdaController;
exports.handler = async (event: any, result: any) => {
  if (!lambda) {
    const f = fastify();
    lambdaController = new LambdaController(f);
    const controllers = {
      "/": import("./RootController"),
    };
    lambda = await awsLambdaFastify(f);
  }
  await lambdaController.registerRoutes(controllers, { path: url } as any as APIGatewayEvent);
  return lambda(event, result);
};
```
