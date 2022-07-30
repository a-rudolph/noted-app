import { useCallback, useEffect, useRef } from "react";
import { trpc } from "../utils/trpc";
import type { InferQueryOutput } from "../utils/trpc-helpers";

export type NoteType =
  InferQueryOutput<"note.infiniteNotes">["notes"][number];

const useOnScrollToBottom = (onScrolled: VoidFunction) => {
  const onScroll = useCallback(() => {
    const { scrollHeight, scrollTop, clientHeight } =
      document.documentElement;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      onScrolled();
    }
  }, [onScrolled]);

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [onScroll]);
};

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

  const throttling = useRef(false);

  const onScroll = useCallback(async () => {
    if (throttling.current) return;

    throttling.current = true;

    setTimeout(() => {
      throttling.current = false;
    }, 600);

    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  useOnScrollToBottom(onScroll);

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
