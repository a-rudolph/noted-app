import Head from "next/head";
import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import { useMemo } from "react";
import { createSSGHelpers } from "@trpc/react/ssg";
import { appRouter } from "../server/router";
import superjson from "superjson";
import { createContext } from "../server/router/context";
import NoteForm from "../components/NoteForm";
import Note from "../components/Note";
import ProfileButton from "../components/ProfileButton";
import Link from "next/link";

export const getServerSideProps = async () => {
  const ssg = await createSSGHelpers({
    router: appRouter,
    ctx: createContext(),
    transformer: superjson,
  });

  await ssg.prefetchQuery("note.getByUser");

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};

const MyNotes: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(["note.getByUser"], {
    refetchOnWindowFocus: false,
  });

  const utils = trpc.useContext();

  const reversedNotes = useMemo(() => {
    if (!data) return [];

    const notes = [...data.notes];

    return notes.reverse();
  }, [data]);

  return (
    <>
      <Head>
        <title>My - Noted</title>
        <meta name="description" content="share notes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex justify-end w-full min-h-12 gap-2">
          <Link href="/">
            <button className="btn btn-link text-accent">Home</button>
          </Link>
          <ProfileButton />
        </div>
        <div className="w-screen max-w-xl p-6">
          <h1 className="w-full font-bold text-4xl mb-2">
            Take <span className="text-primary">Note</span>
          </h1>
          <NoteForm
            onSubmit={() => {
              utils.invalidateQueries(["note.getByUser"]);
            }}
          />
          <div className="py-6">
            {!data && isLoading && <div className="mb-6">...loading</div>}
            {Boolean(!reversedNotes.length) && !isLoading && (
              <div className="mb-6">no notes!</div>
            )}
            {reversedNotes.map((note) => {
              return <Note key={note.id} note={note} />;
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyNotes;
