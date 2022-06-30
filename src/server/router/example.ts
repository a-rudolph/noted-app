import { createRouter } from "./context";
import { z } from "zod";

export const exampleRouter = createRouter()
  .query("hello", {
    input: z
      .object({
        text: z.string().nullish(),
      })
      .nullish(),
    resolve({ input }) {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    },
  })
  .query("getAll", {
    async resolve({ ctx }) {
      return { notes: await ctx.prisma.note.findMany() };
    },
  })
  .mutation("addNote", {
    input: z.object({
      name: z.string(),
      content: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.note.create({
        data: input,
      });
    },
  });
