import { trpc } from "../utils/trpc";
import { useState } from "react";
import { cx } from "../utils/classnames";
import { FaBookOpen, FaLock } from "react-icons/fa";
import Tooltip from "./Tooltip";
import { FormProps, useForm } from "../utils/use-form";
import { useAuthed } from "../utils/use-authed";
import { NoteFields } from "./NoteFields";
import type { NoteValues } from "./NoteFields";
import type { TQuery } from "../utils/trpc-helpers";

type NoteFormProps = FormProps<NoteValues> & {
  noteId?: string;
  onSuccess?: () => void;
  queryOptions: {
    limit: number;
    myNotes: boolean;
  };
};

const useCreateNote = ({
  onSuccess,
  queryOptions,
}: {
  onSuccess: VoidFunction;
  queryOptions?: {
    limit: number;
    myNotes: boolean;
  };
}) => {
  const utils = trpc.useContext();

  const key: TQuery = "note.infiniteNotes";

  const previousNotes = utils.getInfiniteQueryData([
    key,
    queryOptions,
  ]);

  const { mutate, isLoading } = trpc.useMutation(
    ["note.addNote"],
    {
      onMutate: async (input) => {
        onSuccess();

        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await utils.cancelQuery([key, queryOptions]);

        // Snapshot the previous value
        const previousNotes = utils.getInfiniteQueryData([
          key,
          queryOptions,
        ]);

        const setter = (prev: typeof previousNotes) => {
          const prevPages = prev?.pages || [];

          const newNote: typeof prevPages[number]["notes"][number] =
            {
              id: "tempid".concat(
                new Date().getUTCMilliseconds().toString()
              ),
              author: null,
              isPrivate: input.isPrivate || false,
              content: input.content || "no content",
              title: input.title,
              createdAt: new Date(),
            };

          const [
            latestPage = {
              notes: [],
              nextCursor: null,
            },
            ...rest
          ] = prevPages;

          const newPage = {
            notes: [newNote, ...latestPage.notes],
            nextCursor: latestPage.nextCursor,
          };

          const nextPages = [newPage, ...rest];

          const next: typeof prev = {
            pages: nextPages,
            pageParams: prev?.pageParams || [],
          };

          return next;
        };

        // Optimistically update to the new value
        utils.setInfiniteQueryData(
          [key, queryOptions],
          setter
        );

        // Return a context object with the snapshotted value
        return { previousNotes };
      },
      onError: (err, values, context) => {
        utils.setInfiniteQueryData(
          [key, queryOptions],
          context?.previousNotes || {
            pages: [],
            pageParams: [],
          }
        );
      },
      // Always refetch after error or success:
      onSettled: () => {
        utils.invalidateQueries([key, queryOptions]);
      },
    }
  );

  return [mutate, isLoading] as [
    typeof mutate,
    typeof isLoading
  ];
};

const useUpdateNote = ({
  onSuccess,
  queryOptions,
}: {
  onSuccess: VoidFunction;
  queryOptions?: {
    limit: number;
    myNotes: boolean;
  };
}) => {
  const utils = trpc.useContext();

  const key: TQuery = "note.infiniteNotes";

  const previousNotes = utils.getInfiniteQueryData([
    key,
    queryOptions,
  ]);

  const { mutate: update, isLoading: isUpdating } =
    trpc.useMutation(["note.updateNote"], {
      onMutate: async (input) => {
        onSuccess();

        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await utils.cancelQuery([key, queryOptions]);

        // Snapshot the previous value
        const previousNotes = utils.getInfiniteQueryData([
          key,
          queryOptions,
        ]);

        const setter = (prev: typeof previousNotes) => {
          const prevPages = prev?.pages || [];

          const prevPage = prevPages.find((page) => {
            return page.notes.find(
              (note) => note.id === input.id
            );
          });

          const prevNote = prevPage?.notes.find(
            (note) => note.id === input.id
          );

          if (!prevNote) throw Error("sorry");

          const newNote = {
            ...prevNote,
            content: input.content || "",
            title: input.title || "",
            isPrivate: input.isPrivate || false,
          };

          const nextPages = prevPages.map((page) => {
            if (
              page.notes.find(
                (note) => note.id === input.id
              )
            ) {
              return {
                ...page,
                notes: page.notes.map((note) => {
                  if (note.id === input.id) {
                    return newNote;
                  }
                  return note;
                }),
              };
            }
            return page;
          });

          const next: typeof prev = {
            pages: nextPages,
            pageParams: prev?.pageParams || [],
          };

          return next;
        };

        // Optimistically update to the new value
        utils.setInfiniteQueryData(
          [key, queryOptions],
          setter
        );

        // Return a context object with the snapshotted value
        return { previousNotes };
      },
      onError: (err, values, context) => {
        utils.setInfiniteQueryData(
          [key, queryOptions],
          context?.previousNotes || {
            pages: [],
            pageParams: [],
          }
        );
      },
      // Always refetch after error or success:
      onSettled: () => {
        utils.invalidateQueries([key, queryOptions]);
      },
    });

  return { update, isUpdating };
};

const NoteForm: React.FC<NoteFormProps> = ({
  initialValues,
  noteId,
  onSuccess: incomingOnSuccess,
  queryOptions,
}) => {
  const isAuthed = useAuthed();

  const {
    isValidating,
    editForm,
    resetForm,
    values,
    validateFields,
  } = useForm({ initialValues });

  const onSuccess = () => {
    resetForm();
    incomingOnSuccess?.();
  };

  const [create, isCreating] = useCreateNote({
    onSuccess,
    queryOptions,
  });

  const { update, isUpdating } = useUpdateNote({
    onSuccess,
    queryOptions,
  });

  const isLoading = isCreating || isUpdating;

  const handleSubmit = () => {
    validateFields((values) => {
      const validate = (
        values: Partial<NoteValues>
      ): values is NoteValues => {
        return Boolean(values.title);
      };

      if (!validate(values)) {
        return;
      }

      if (noteId) {
        update({
          id: noteId,
          ...values,
        });
        return;
      }

      create(values);
    });
  };

  const { isPrivate } = values;

  return (
    <>
      <NoteFields
        values={values}
        isValidating={isValidating}
        editForm={editForm}
      />
      <div className="flex justify-end w-full gap-2">
        <AddNoteButton
          isPrivate={!!isPrivate}
          togglePrivate={() => {
            editForm({ isPrivate: !isPrivate });
          }}
          canNotePrivately={isAuthed}
          isDisabled={isLoading}
          onClick={handleSubmit}
        />
      </div>
    </>
  );
};

const AddNoteButton: React.FC<{
  onClick: VoidFunction;
  canNotePrivately: boolean;
  isDisabled: boolean;
  isNoted?: boolean;
  isPrivate: boolean;
  togglePrivate: VoidFunction;
}> = ({
  onClick,
  isNoted,
  isDisabled,
  canNotePrivately,
  isPrivate,
  togglePrivate,
}) => {
  const [removeTooltip, setRemoveTooltip] = useState(false);

  if (isNoted) {
    return (
      <button
        className={`btn btn-primary w-40`}
        disabled={isDisabled}
      >
        <div className="text-center text-primary">
          Noted!
        </div>
      </button>
    );
  }

  const btnTheme = cx({
    "btn-primary": !isPrivate,
    "btn-secondary": isPrivate,
  });

  if (!canNotePrivately) {
    return (
      <button
        className={`btn ${btnTheme} w-40`}
        disabled={isDisabled}
        onClick={onClick}
      >
        <div className="text-center flex justify-between w-full items-center">
          <span className="text-sm">Post Note</span>
          <FaBookOpen />
        </div>
      </button>
    );
  }

  return (
    <div className={`flex items-center`}>
      <button
        className={`btn ${btnTheme} rounded-r-none w-40`}
        disabled={isDisabled}
        onClick={onClick}
      >
        {isPrivate && (
          <div className="text-center">Save Privately</div>
        )}
        {isPrivate || (
          <div className="text-center">Post Publicly</div>
        )}
      </button>
      {canNotePrivately && (
        <Tooltip title="toggle privacy">
          <button
            disabled={isDisabled}
            onClick={() => {
              togglePrivate();
            }}
            className={`btn ${btnTheme} ${cx({
              "border-l-primary-focus": !isPrivate,
              "border-l-secondary-focus": isPrivate,
            })} rounded-l-none border-2`}
          >
            {isPrivate ? <FaLock /> : <FaBookOpen />}
          </button>
        </Tooltip>
      )}
    </div>
  );
};

export default NoteForm;
