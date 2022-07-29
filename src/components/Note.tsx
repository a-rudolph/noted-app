import type { CSSProperties } from "react";
import moment from "moment";
import { FaTrash } from "react-icons/fa";
import { useTypedSession } from "../utils/use-typed-session";
import { trpc } from "../utils/trpc";
import { InferQueryOutput } from "../utils/trpc-helpers";
import NoteForm from "./NoteForm";
import React from "react";

type NoteType =
  InferQueryOutput<"note.getAll">["notes"][number];

const useNote = (note: NoteType) => {
  const utils = trpc.useContext();

  const { mutate } = trpc.useMutation("note.deleteNote", {
    onSuccess: () => {
      utils.invalidateQueries("note.getAll");
      utils.invalidateQueries("note.getByUser");
    },
  });

  const { data } = useTypedSession();

  const isMyNote = data?.user?.id === note.author?.id;

  return {
    deleteNote: () => {
      mutate({ id: note.id });
    },
    isMyNote,
  };
};

const Card: React.FC<{
  title?: React.ReactNode;
  children: React.ReactNode;
}> = ({ children, title }) => {
  return (
    <div className="card card-compact bg-base-300 prose">
      <div className="card-body">
        {title && (
          <>
            <div className="card-title text-2xl">
              {title}
            </div>
            <hr className="m-0" />
          </>
        )}
        {children}
      </div>
    </div>
  );
};

const Note: React.FC<{ note: NoteType }> = ({ note }) => {
  const { deleteNote, isMyNote } = useNote(note);

  const needsBreakWord = (content: string) => {
    return !content.includes(" ");
  };

  const breakWordStyle = (
    content: string
  ): CSSProperties => {
    return needsBreakWord(content)
      ? { wordBreak: "break-word" }
      : {};
  };

  const isFormMode = false;

  if (isFormMode) {
    return (
      <div className="note mb-10">
        <Card>
          <NoteForm />
        </Card>
      </div>
    );
  }

  return (
    <div className="note mb-10">
      <div className="flex justify-between m-2">
        <div className="text-gray-500 whitespace-nowrap">
          {note.author?.name}
        </div>
        <div className="text-gray-500 whitespace-nowrap">
          {moment(note.createdAt).format("lll")}
        </div>
      </div>
      <Card
        title={
          <div className="flex justify-between items-baseline">
            <div className="flex-1">
              <span style={breakWordStyle(note.title)}>
                {note.title}
              </span>
            </div>
            {isMyNote && (
              <button
                className="btn btn-link text-secondary"
                onClick={deleteNote}
              >
                <FaTrash />
              </button>
            )}
          </div>
        }
      >
        <div
          className="py-2"
          style={breakWordStyle(note.content)}
        >
          {note.content}
        </div>
      </Card>
    </div>
  );
};

export default Note;
