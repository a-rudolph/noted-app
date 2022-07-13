import type { Context } from "./context";
import { createRouter } from "./context";
import { getSession } from "next-auth/react";
import { z } from "zod";

const getUser = async (ctx: Context) => {
  const session = await getSession(ctx);

  const user = await ctx.prisma.user.findFirst({
    where: {
      email: session?.email as string,
    },
  });

  return user;
};

export const noteRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      const notes = await ctx.prisma.note.findMany();

      return { notes };
    },
  })
  .query("getByUser", {
    async resolve({ ctx }) {
      const user = await getUser(ctx);

      if (!user) {
        throw new Error("User not found");
      }

      const notes = await ctx.prisma.note.findMany({
        where: {
          authorId: user.id,
        },
      });

      return { notes };
    },
  })
  .mutation("addNote", {
    input: z.object({
      title: z.string().min(4).max(20),
      content: z.string().min(10).max(180),
    }),
    async resolve({ ctx, input }) {
      const user = await getUser(ctx);

      if (!user) {
        throw new Error("User not found");
      }

      return await ctx.prisma.note.create({
        data: { ...input, authorId: user.id },
      });
    },
  });
