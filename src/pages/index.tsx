import Head from "next/head";
import type { NextPage } from "next";
import NoteForm from "../components/NoteForm";
import Note from "../components/Note";
import Link from "next/link";
import ProfileButton from "../components/ProfileButton";
import Collapse from "../components/Collapse";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { cx } from "../utils/classnames";
import { useInfiniteNotes } from "../utils/use-infinite-notes";
import { Loader } from "../components/Loader";
import { useCallback, useEffect, useRef } from "react";

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

const Home: NextPage = () => {
  const {
    notes,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteNotes();

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

  const [animateParent] = useAutoAnimate<HTMLDivElement>();

  return (
    <>
      <Head>
        <title>Noted App</title>
        <meta name="description" content="share notes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col items-center min-h-screen">
        <div className="flex justify-end w-full">
          <ProfileButton
            extraBefore={(isAuthed) => {
              if (!isAuthed) return null;

              return (
                <Link href="/my-notes">
                  <button className="btn btn-link text-accent">
                    My Notes
                  </button>
                </Link>
              );
            }}
          />
        </div>
        <h1 className="font-extrabold mt-4 text-center text-7xl px-3">
          <span className="text-primary">Noted</span> App
        </h1>
        <div className="w-screen max-w-xl p-6">
          <Collapse defaultOpen={false}>
            <NoteForm />
          </Collapse>
          <div className="py-6" ref={animateParent}>
            {notes.map((note) => {
              return (
                <Note
                  queryKey="note.infiniteNotes"
                  key={note.id}
                  note={note}
                />
              );
            })}
            {isLoading && <Loader />}
            {hasNextPage && (
              <button
                className={`btn btn-link text-accent ${cx({
                  loading: isFetchingNextPage,
                })}`}
                onClick={() => fetchNextPage()}
              >
                Load more
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
