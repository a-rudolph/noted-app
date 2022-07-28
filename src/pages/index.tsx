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
import Link from "next/link";
import ProfileButton from "../components/ProfileButton";

export const getServerSideProps = async () => {
  const ssg = await createSSGHelpers({
    router: appRouter,
    ctx: createContext(),
    transformer: superjson,
  });

  await ssg.prefetchQuery("note.getAll");

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};

const Home: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(
    ["note.getAll"],
    {
      refetchOnWindowFocus: false,
    }
  );

  const utils = trpc.useContext();

  const notes = data?.notes || [];

  return (
    <>
      <Head>
        <title>Noted App</title>
        <meta name="description" content="share notes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen">
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
          <NoteForm
            onSubmit={() => {
              utils.invalidateQueries(["note.getAll"]);
            }}
          />
          <div className="py-6">
            {!data && isLoading && (
              <div className="mb-6">...loading</div>
            )}
            {Boolean(!notes.length) && !isLoading && (
              <div className="mb-6">no notes!</div>
            )}
            {notes.map((note) => {
              return <Note key={note.id} note={note} />;
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
