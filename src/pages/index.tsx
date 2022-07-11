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
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";

export const getStaticProps = async (ctx: any) => {
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
  const session = useSession();

  const { data, isLoading } = trpc.useQuery(["note.getAll"], {
    refetchOnWindowFocus: false,
  });

  const reversedNotes = useMemo(() => {
    if (!data) return [];

    const notes = [...data.notes];

    return notes.reverse();
  }, [data]);

  return (
    <>
      <Head>
        <title>Noted App</title>
        <meta name="description" content="share notes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex justify-end w-full min-h-12">
          {session.data?.user && (
            <Link href="/profile">
              <button className="btn btn-link gap-2 text-accent">
                {session.data.user.name}
                <FaUserCircle />
              </button>
            </Link>
          )}
          {session.status === "unauthenticated" && (
            <button
              className="btn btn-link text-accent"
              onClick={() => {
                signIn();
              }}
            >
              Sign In
            </button>
          )}
        </div>
        <h1 className="font-extrabold mt-4 text-center text-7xl px-3">
          <span className="text-primary">Noted</span> App
        </h1>
        <div className="w-screen max-w-xl p-6">
          <NoteForm />
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

export default Home;
