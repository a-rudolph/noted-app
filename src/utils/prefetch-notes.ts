import { createSSGHelpers } from "@trpc/react/ssg";
import { appRouter } from "../server/router";
import superjson from "superjson";
import { createContext } from "../server/router/context";

export const prefetchInfiniteNotes = async () => {
  const ssg = await createSSGHelpers({
    router: appRouter,
    ctx: createContext(),
    transformer: superjson,
  });

  await ssg.prefetchInfiniteQuery("note.infiniteNotes", {
    limit: 10,
  });

  return {
    trpcState: ssg.dehydrate(),
  };
};
