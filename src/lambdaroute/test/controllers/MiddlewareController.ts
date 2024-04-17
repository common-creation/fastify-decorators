import type { FastifyReply, FastifyRequest } from "fastify";
import { BaseController, lambdaroute } from "../..";
import { middleware } from "../../../middleware";

const skipProcess = (statusCode: number) => middleware((req, res, next) => {
  res.status(statusCode).send();
  return;
});

@lambdaroute()
export default class WildcardController extends BaseController {
  @skipProcess(200)
  public static async get(req: FastifyRequest<{ Params: { "*": string } }>, res: FastifyReply) {
    res.status(500).send();
  }
}
