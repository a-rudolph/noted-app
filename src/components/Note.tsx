import { CSSProperties, useState } from "react";
import moment from "moment";
import { FaTrash, FaEdit, FaUndoAlt } from "react-icons/fa";
import { useTypedSession } from "../utils/use-typed-session";
import { trpc } from "../utils/trpc";
import type {
  InferQueryOutput,
  TQuery,
} from "../utils/trpc-helpers";
import NoteForm from "./NoteForm";
import React from "react";
import { Card } from "./Card";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { UNDO_MS } from "../utils/constants";
import { notification } from "../utils/notification";

type NoteType =
  InferQueryOutput<"note.getAll">["notes"][number];

const useNote = (note: NoteType, queryKey: TQuery) => {
  const utils = trpc.useContext();

  const { mutate } = trpc.useMutation("note.deleteNote", {
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await utils.cancelQuery([queryKey]);

      // Snapshot the previous value
      const previousNotes = utils.getQueryData([queryKey]);

      // Optimistically update to the new value
      utils.setQueryData([queryKey], (prev) => {
        const newNotes = prev?.notes.filter(
          (n) => n.id !== id
        );

        return {
          notes: newNotes || [],
        };
      });

      // Return a context object with the snapshotted value
      return { previousNotes };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      notification(err.message);
      utils.setQueryData(
        [queryKey],
        context?.previousNotes || { notes: [] }
      );
    },
    // Always refetch after error or success:
    onSettled: () => {
      utils.invalidateQueries([queryKey]);
    },
  });

  const { data } = useTypedSession();

  // if we don't check that there is also a user, then unauthed with === unauthoredNote
  const isMyNote =
    data?.user && data?.user?.id === note.author?.id;

  return {
    deleteNote: () => {
      mutate({ id: note.id });
    },
    isMyNote,
  };
};

const Note: React.FC<{
  note: NoteType;
  queryKey: TQuery;
}> = ({ note, queryKey }) => {
  const { deleteNote, isMyNote } = useNote(note, queryKey);
  const [isEditing, setIsEditing] = useState(false);

  const [animateParent] = useAutoAnimate<HTMLDivElement>();

  const [pendingDeletion, setPendingDeletion] =
    useState<NodeJS.Timeout>();

  const handleDelete = () => {
    const timeout = setTimeout(() => {
      deleteNote();
    }, UNDO_MS);

    setPendingDeletion(timeout);
  };

  const undoDelete = () => {
    setPendingDeletion((timeout) => {
      clearTimeout(timeout);
      return undefined;
    });
  };

  if (pendingDeletion) {
    return (
      <div ref={animateParent} className="mb-10">
        <div className="card shadow-lg flex-col relative overflow-hidden">
          <div className="flex justify-between items-center bg-base-300 w-full pl-4">
            <div>note deleted</div>
            <button
              className="btn btn-link text-error"
              onClick={undoDelete}
            >
              <div className="w-full flex items-center gap-2">
                <span className="text-sm">undo</span>
                <FaUndoAlt />
              </div>
            </button>
          </div>
          <div className="w-full bg-base-100 rounded absolute bottom-0">
            <div className="w-full origin-right scale-x-0 animate-undo h-1 bg-error rounded" />
          </div>
        </div>
      </div>
    );
  }

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

  if (isEditing) {
    return (
      <div ref={animateParent} className="note mb-10">
        <Card>
          <NoteForm
            initialValues={{
              title: note.title,
              content: note.content,
              isPrivate: note.isPrivate || false,
            }}
            noteId={note.id}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => {
              setIsEditing(false);
            }}
          />
        </Card>
      </div>
    );
  }

  return (
    <div ref={animateParent} className="note mb-10">
      <div className="flex justify-between m-2">
        <div className="text-gray-500 whitespace-nowrap">
          {note.author?.name || "anonymous"}
        </div>
        <div className="text-gray-500 whitespace-nowrap">
          {moment(note.createdAt).format("lll")}
        </div>
      </div>
      <Card
        leftFlair={note.isPrivate ? "secondary" : "primary"}
        title={
          <div className="flex w-full justify-between items-baseline">
            <div className="flex-1">
              <span style={breakWordStyle(note.title)}>
                {note.title}
              </span>
            </div>
            {isMyNote && (
              <div className="flex">
                <button
                  className="btn btn-link text-accent"
                  onClick={() => {
                    setIsEditing(true);
                  }}
                >
                  <FaEdit />
                </button>
                <button
                  className="btn btn-link text-error"
                  onClick={handleDelete}
                >
                  <FaTrash />
                </button>
              </div>
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
