import { trpc } from "../utils/trpc";
import { useState } from "react";
import { cx } from "../utils/classnames";
import { FaBookOpen, FaLock } from "react-icons/fa";
import Tooltip from "./Tooltip";
import { FormProps, useForm } from "../utils/use-form";
import { useAuthed } from "../utils/use-authed";
import { NoteFields } from "./NoteFields";
import type { NoteValues } from "./NoteFields";

type NoteFormProps = FormProps<NoteValues> & {
  noteId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const NoteForm: React.FC<NoteFormProps> = ({
  initialValues,
  noteId,
  onSuccess,
  onCancel,
}) => {
  const utils = trpc.useContext();

  const isAuthed = useAuthed();

  const {
    isValidating,
    editForm,
    resetForm,
    values,
    validateFields,
  } = useForm({ initialValues });

  const mutateOptions = {
    onSuccess: () => {
      utils.invalidateQueries(["note.getAll"]);
      utils.invalidateQueries(["note.getByUser"]);
      resetForm();
      onSuccess?.();
    },
  };

  const { mutate: create, isLoading: isCreating } =
    trpc.useMutation(["note.addNote"], mutateOptions);

  const { mutate: update, isLoading: isUpdating } =
    trpc.useMutation(["note.updateNote"], mutateOptions);

  const isLoading = isCreating || isUpdating;

  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };

  const handleSubmit = () => {
    validateFields((values) => {
      const validate = (
        values: Partial<NoteValues>
      ): values is NoteValues => {
        return Boolean(values.content && values.title);
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
        {onCancel && (
          <button
            className="btn"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
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
    <div className={`flex items-center w-40`}>
      <button
        className={`btn ${btnTheme} rounded-r-none`}
        disabled={isDisabled}
        onClick={onClick}
      >
        {isPrivate && (
          <div className="text-center">Save Note</div>
        )}
        {isPrivate || (
          <div className="text-center">Post Note</div>
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
