import type { FastifyReply, FastifyRequest } from "fastify";
import { BaseController, lambdaroute } from "../..";

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
