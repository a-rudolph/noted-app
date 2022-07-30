import Head from "next/head";
import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import { createSSGHelpers } from "@trpc/react/ssg";
import { appRouter } from "../server/router";
import superjson from "superjson";
import { createContext } from "../server/router/context";
import NoteForm from "../components/NoteForm";
import Note from "../components/Note";
import ProfileButton from "../components/ProfileButton";
import Link from "next/link";
import Collapse from "../components/Collapse";
import { useAutoAnimate } from "@formkit/auto-animate/react";

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
  const { data, isLoading } = trpc.useQuery(
    ["note.getByUser"],
    {
      refetchOnWindowFocus: false,
    }
  );

  const notes = data?.notes || [];

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
            {!data && isLoading && (
              <div className="mb-6">...loading</div>
            )}
            {Boolean(!notes.length) && !isLoading && (
              <div className="mb-6">no notes!</div>
            )}
            {notes.map((note) => {
              return (
                <Note
                  queryKey="note.getByUser"
                  key={note.id}
                  note={note}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyNotes;
