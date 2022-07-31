import { CSSProperties, useState } from "react";
import moment from "moment";
import { FaTrash, FaEdit } from "react-icons/fa";
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
import { Notification } from "../utils/notification";
import { Button } from "./Button";
import { InfiniteNoteOptions } from "../server/router";

type NoteType =
  InferQueryOutput<"note.getAll">["notes"][number];

const useNote = (
  note: NoteType,
  queryOptions: InfiniteNoteOptions
) => {
  const utils = trpc.useContext();

  const { mutate } = trpc.useMutation("note.deleteNote", {
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await utils.cancelQuery([
        "note.infiniteNotes",
        queryOptions,
      ]);

      // Snapshot the previous value
      const previousNotes = utils.getInfiniteQueryData([
        "note.infiniteNotes",
        queryOptions,
      ]);

      // Optimistically update to the new value
      utils.setInfiniteQueryData(
        ["note.infiniteNotes", queryOptions],
        (prev) => {
          const prevPages = prev?.pages || [];

          const prevPage = prevPages.find((page) => {
            return page.notes.find(
              (note) => note.id === id
            );
          });

          if (!prevPage) {
            return (
              prev || {
                pages: [],
                pageParams: [],
              }
            );
          }

          const newNotes = prevPage.notes.filter(
            (n) => n.id !== id
          );

          const nextPages = prevPages.map((page) => {
            if (page.nextCursor === prevPage.nextCursor) {
              return {
                notes: newNotes,
                nextCursor: prevPage.nextCursor,
              };
            }

            return page;
          });

          return {
            pages: nextPages,
            pageParams: prev?.pageParams || [],
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousNotes };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, input, context) => {
      utils.setInfiniteQueryData(
        ["note.infiniteNotes", queryOptions],
        context?.previousNotes || {
          pages: [],
          pageParams: [],
        }
      );
    },
    // Always refetch after error or success:
    onSettled: () => {
      utils.invalidateQueries([
        "note.infiniteNotes",
        queryOptions,
      ]);
    },
  });

  return {
    deleteNote: () => {
      mutate({ id: note.id });
    },
  };
};

const useIsMyNote = (note: NoteType) => {
  const { data } = useTypedSession();

  // if we don't check that there is also a user, then unauthed with === unauthoredNote
  const isMyNote =
    data?.user && data?.user?.id === note.author?.id;

  return isMyNote;
};

const needsBreakWord = (content: string) => {
  return !content.includes(" ");
};

const breakWordStyle = (content: string): CSSProperties => {
  return needsBreakWord(content)
    ? { wordBreak: "break-word" }
    : {};
};

const Note: React.FC<{
  note: NoteType;
  queryOptions: {
    limit: number;
    myNotes: boolean;
  };
}> = ({ note, queryOptions }) => {
  const { deleteNote } = useNote(note, queryOptions);
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
      <Notification
        message="note deleted"
        onUndo={undoDelete}
        onClose={() => {}}
      />
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
        onClose={isEditing && (() => setIsEditing(false))}
        leftFlair={note.isPrivate ? "secondary" : "primary"}
        title={
          !isEditing && (
            <NoteTitle
              note={note}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDelete}
            />
          )
        }
      >
        {isEditing || (
          <div
            className="py-2"
            style={breakWordStyle(note.content)}
          >
            {note.content}
          </div>
        )}
        {isEditing && (
          <NoteForm
            queryOptions={queryOptions}
            initialValues={{
              title: note.title,
              content: note.content,
              isPrivate: note.isPrivate || false,
            }}
            noteId={note.id}
            onSuccess={() => {
              setIsEditing(false);
            }}
          />
        )}
      </Card>
    </div>
  );
};

const NoteTitle: React.FC<{
  note: NoteType;
  onDelete: VoidFunction;
  onEdit: VoidFunction;
}> = ({ note, onEdit, onDelete }) => {
  const isMyNote = useIsMyNote(note);

  return (
    <div className="flex w-full justify-between items-baseline">
      <div className="flex-1">
        <span style={breakWordStyle(note.title)}>
          {note.title}
        </span>
      </div>
      {isMyNote && (
        <div className="flex">
          <Button
            link={true}
            type="accent"
            onClick={onEdit}
          >
            <FaEdit />
          </Button>
          <Button
            link={true}
            type="error"
            onClick={onDelete}
          >
            <FaTrash />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Note;
