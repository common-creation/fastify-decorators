import type { FastifyReply, FastifyRequest } from "fastify";
import { BaseController, lambdaroute } from "../..";

@lambdaroute()
export default class SomeController extends BaseController {
  public static async get(req: FastifyRequest, res: FastifyReply) {
    res.status(510).send();
  }
  public static async post(req: FastifyRequest, res: FastifyReply) {
    res.status(511).send();
  }
  public static async put(req: FastifyRequest, res: FastifyReply) {
    res.status(512).send();
  }
  public static async patch(req: FastifyRequest, res: FastifyReply) {
    res.status(513).send();
  }
  public static async delete(req: FastifyRequest, res: FastifyReply) {
    res.status(514).send();
  }
  public static async head(req: FastifyRequest, res: FastifyReply) {
    res.status(515).send();
  }
}
