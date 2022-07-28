import type { CSSProperties } from "react";
import type { Note as NoteType } from "@prisma/client";
import moment from "moment";
import { FaTrash } from "react-icons/fa";
import { useTypedSession } from "../utils/use-typed-session";
import { trpc } from "../utils/trpc";

const useNote = (note: NoteType) => {
  const utils = trpc.useContext();

  const { mutate } = trpc.useMutation("note.deleteNote", {
    onSuccess: () => {
      utils.invalidateQueries("note.getAll");
      utils.invalidateQueries("note.getByUser");
    },
  });

  const { data } = useTypedSession();

  const isMyNote = data?.user?.id === note.authorId;

  return {
    deleteNote: () => {
      mutate({ id: note.id });
    },
    isMyNote,
  };
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

  return (
    <div className="prose mb-6" key={note.id}>
      <div className="flex justify-between items-baseline">
        <div className="text-2xl flex-1">
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
        <div className="text-gray-500 whitespace-nowrap">
          {moment(note.createdAt).format("lll")}
        </div>
      </div>
      <hr className="m-0" />
      <div
        className="py-2"
        style={breakWordStyle(note.content)}
      >
        {note.content}
      </div>
    </div>
  );
};

export default Note;
