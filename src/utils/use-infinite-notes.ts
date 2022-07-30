import { trpc } from "../utils/trpc";
import type { InferQueryOutput } from "../utils/trpc-helpers";

export type NoteType =
  InferQueryOutput<"note.infiniteNotes">["notes"][number];

export const useInfiniteNotes = (options?: {
  myNotes?: boolean;
}) => {
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = trpc.useInfiniteQuery(
    [
      "note.infiniteNotes",
      {
        limit: 10,
        myNotes: options?.myNotes,
      },
    ],
    {
      refetchOnWindowFocus: false,
      retry: false,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const accumulateNotes = () => {
    if (!data || !data.pages) return [];

    return data.pages.reduce(
      (acc, page) => acc.concat(page.notes),
      [] as NoteType[]
    );
  };

  const notes = accumulateNotes();

  return {
    notes,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
};
