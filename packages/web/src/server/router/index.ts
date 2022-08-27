import { createRouter } from "./context";
import superjson from "superjson";

import { noteRouter } from "./note";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("note.", noteRouter);

// export type definition of API
export type AppRouter = typeof appRouter;

export type InfiniteNoteOptions = {
  limit: number;

  // only my notes, false will still include mine
  myNotes?: boolean;
};
