import { createRouter } from "./context";
import { z } from "zod";

export const exampleRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      const notes = await ctx.prisma.note.findMany();

      return { notes };
    },
  })
  .mutation("addNote", {
    input: z.object({
      name: z.string().min(4).max(20),
      content: z.string().min(10).max(200),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.note.create({
        data: {
          ...input,
          title: input.name,
        },
      });
    },
  });
