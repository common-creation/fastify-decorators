import type { FastifyReply, FastifyRequest } from "fastify";
import { BaseController, lambdaroute } from "../..";

@lambdaroute()
export default class SomeController extends BaseController {
  public static async get(req: FastifyRequest<{ Params: { "params": string } }>, res: FastifyReply) {
    if (req.params.params === "param1") {
      res.status(200).send();
    } else {
      res.status(500).send();
    }
  }
}
