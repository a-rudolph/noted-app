import { createRouter } from "./context";
import { z } from "zod";

export const noteRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      const notes = await ctx.prisma.note.findMany();

      return { notes };
    },
  })
  .mutation("addNote", {
    input: z.object({
      title: z.string().min(4).max(20),
      content: z.string().min(10).max(180),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.note.create({
        data: input,
      });
    },
  });
