import { FastifyReply, FastifyRequest } from "fastify";

export const middleware = (
  func: (req: FastifyRequest, res: FastifyReply, next: (nextReq: FastifyRequest, nextRes: FastifyReply) => any) => any,
) => {
  return (target: Function, key: string, descriptor: any) => {
    if (descriptor === undefined) {
      descriptor = Object.getOwnPropertyDescriptor(target, key);
    }
    const originalMethod = descriptor.value;

    descriptor.value = (currentReq: FastifyRequest, currentRes: FastifyReply) =>
      func(currentReq, currentRes, (nextReq, nextRes) => {
        return originalMethod.apply(target, [nextReq, nextRes]);
      });

    return descriptor;
  };
};
