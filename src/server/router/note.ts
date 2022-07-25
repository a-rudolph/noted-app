import type { Context } from "./context";
import { createRouter } from "./context";
import { getSession } from "next-auth/react";
import { z } from "zod";

const getUser = async (ctx: Context) => {
  const session = await getSession(ctx);

  if (session?.user?.email) {
    const user = await ctx.prisma.user.findUnique({
      where: {
        email: session?.user?.email || "",
      },
    });

    return user;
  }

  return null;
};

export const noteRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      const notes = await ctx.prisma.note.findMany({
        where: {
          isPrivate: false,
        },
      });

      return { notes };
    },
  })
  .query("getByUser", {
    async resolve({ ctx }) {
      const user = await getUser(ctx);

      if (!user) {
        return { notes: [] };
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
      isPrivate: z.boolean().optional(),
    }),
    async resolve({ ctx, input }) {
      const user = await getUser(ctx);

      if (!user && input.isPrivate) {
        throw new Error("You must be logged in to add private notes");
      }

      return await ctx.prisma.note.create({
        data: { ...input, authorId: user?.id },
      });
    },
  });
