import Head from "next/head";
import type { NextPage } from "next";
import NoteForm from "../components/NoteForm";
import Note from "../components/Note";
import ProfileButton from "../components/ProfileButton";
import Link from "next/link";
import Collapse from "../components/Collapse";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useInfiniteNotes } from "../utils/use-infinite-notes";
import { cx } from "../utils/classnames";
import { Loader } from "../components/Loader";

const MyNotes: NextPage = () => {
  const {
    notes,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteNotes({ myNotes: true });

  const [animateParent] = useAutoAnimate<HTMLDivElement>();

  return (
    <>
      <Head>
        <title>My - Noted</title>
        <meta name="description" content="share notes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col items-center min-h-screen">
        <div className="flex justify-end w-full">
          <Link href="/">
            <button className="btn btn-link text-accent">
              Home
            </button>
          </Link>
          <ProfileButton />
        </div>
        <div className="w-screen max-w-xl p-6">
          <h1 className="w-full font-bold text-4xl mb-2">
            Take <span className="text-primary">Note</span>
          </h1>
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

export default MyNotes;
