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
  .query("infiniteNotes", {
    input: z.object({
      limit: z.number().min(1).max(100).nullish(),
      myNotes: z.boolean().optional(),
      cursor: z.string().nullish(),
    }),
    async resolve({ input, ctx }) {
      const limit = input.limit ?? 5;
      const { cursor } = input;

      const user = await getUser(ctx);

      if (input.myNotes && !user) {
        throw new Error(
          "You must be logged in to view your notes"
        );
      }

      const notes = await ctx.prisma.note.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        cursor: cursor ? { id: cursor } : undefined,
        select: noteSelect,
        where: input.myNotes
          ? {
              authorId: user?.id,
            }
          : {
              OR: [
                {
                  isPrivate: false,
                },
                { authorId: user?.id },
              ],
            },
        orderBy: [
          {
            createdAt: "desc",
          },
          {
            id: "desc",
          },
        ],
      });

      let nextCursor: typeof cursor | null = null;
      if (notes.length > limit) {
        const nextItem = notes.pop();
        nextCursor = nextItem!.id;
      }

      return {
        notes,
        nextCursor,
      };
    },
  })
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
      content: z.string().max(180).default("no content"),
      isPrivate: z.boolean().optional(),
    }),
    async resolve({ ctx, input }) {
      const user = await getUser(ctx);

      if (!user && input.isPrivate) {
        throw new Error(
          "You must be logged in to add private notes"
        );
      }

      const note = await ctx.prisma.note.create({
        data: { ...input, authorId: user?.id },
      });

      return {
        note,
        author: user && {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      };
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
      content: z.string().max(180).optional(),
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
        data: {
          title: input.title,
          content: input.content,
          isPrivate: input.isPrivate,
        },
      });
    },
  });
