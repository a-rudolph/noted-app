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

const noteSelect = {
  id: true,
  title: true,
  content: true,
  createdAt: true,
  isPrivate: true,
  author: {
    select: {
      id: true,
      name: true,
      image: true,
    },
  },
};

export const noteRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      const notes = await ctx.prisma.note.findMany({
        where: {
          isPrivate: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: noteSelect,
      });

      return { notes };
    },
  })
  .query("getByUser", {
    async resolve({ ctx }) {
      const user = await getUser(ctx);

      if (!user) {
        if (ctx.res) ctx.res.statusCode = 401;
        // return { error: "Unauthorized" };
        throw new Error("Unauthorized");
      }

      const notes = await ctx.prisma.note.findMany({
        where: {
          authorId: user.id,
        },
        select: noteSelect,
        orderBy: {
          createdAt: "desc",
        },
      });

      return { notes };
    },
  })
  .mutation("addNote", {
    input: z.object({
      title: z.string().min(4).max(40),
      content: z.string().min(10).max(180),
      isPrivate: z.boolean().optional(),
    }),
    async resolve({ ctx, input }) {
      const user = await getUser(ctx);

      if (!user && input.isPrivate) {
        throw new Error(
          "You must be logged in to add private notes"
        );
      }

      return await ctx.prisma.note.create({
        data: { ...input, authorId: user?.id },
      });
    },
  })
  .mutation("deleteNote", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const user = await getUser(ctx);

      if (!user) {
        throw new Error(
          "You must be logged in to delete notes"
        );
      }

      const note = await ctx.prisma.note.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!note) {
        throw new Error("Note not found");
      }

      if (note.authorId !== user.id) {
        throw new Error(
          "You cannot delete notes that you did not create"
        );
      }

      return await ctx.prisma.note.delete({
        where: {
          id: input.id,
        },
      });
    },
  })
  .mutation("updateNote", {
    input: z.object({
      id: z.string(),
      title: z.string().min(4).max(40),
      content: z.string().min(10).max(180),
      isPrivate: z.boolean().optional(),
    }),
    async resolve({ ctx, input }) {
      const user = await getUser(ctx);

      if (!user) {
        throw new Error(
          "You must be logged in to update notes"
        );
      }

      const note = await ctx.prisma.note.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!note) {
        throw new Error("Note not found");
      }

      if (note.authorId !== user.id) {
        throw new Error(
          "You cannot update notes that you did not create"
        );
      }

      return await ctx.prisma.note.update({
        where: {
          id: input.id,
        },
        data: { ...input },
      });
    },
  });
