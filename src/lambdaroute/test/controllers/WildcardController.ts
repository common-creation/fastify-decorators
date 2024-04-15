import type { FastifyReply, FastifyRequest } from "fastify";
import { BaseController, lambdaroute } from "../..";

@lambdaroute()
export default class WildcardController extends BaseController {
  public static async get(req: FastifyRequest<{ Params: { "*": string } }>, res: FastifyReply) {
    if (req.url === "/path/to/some/wildcard/endpoint/with/wild/card" && req.params["*"] === "wild/card") {
      res.status(200).send();
    } else {
      res.status(500).send();
    }
  }
}
