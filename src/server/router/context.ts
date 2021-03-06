import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { prisma } from "../db/client";

export const createContext = (options?: trpcNext.CreateNextContextOptions) => {
  return {
    req: options?.req,
    res: options?.res,
    prisma,
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();
