import { trpc } from "../utils/trpc";
import { useMemo, useState } from "react";
import { cx } from "../utils/classnames";
import { FaBookOpen, FaLock } from "react-icons/fa";
import Collapse from "./Collapse";
import Tooltip from "./Tooltip";
import { FormProps, useForm } from "../utils/use-form";
import { useAuthed } from "../utils/use-authed";

type NoteValues = {
  title: string;
  content: string;
  isPrivate: boolean;
};

type NoteFormProps = FormProps<NoteValues>;

const NoteFields: React.FC<{
  values: Partial<NoteValues>;
  isValidating?: boolean;
  editForm: (values: Partial<NoteValues>) => void;
}> = ({ values, editForm, isValidating }) => {
  const { title = "", content = "" } = values;

  const titleError = title.length < 4 && isValidating;

  const contentProps = useMemo(() => {
    if (content.includes("\n")) {
      return {
        status: "border-warning",
        extra: (
          <div className="text-warning">
            <span className="text-sm">
              (new lines will be converted to spaces)
            </span>
          </div>
        ),
      };
    }

    if (content.length < 10 && isValidating) {
      return {
        status: "border-error",
        extra: (
          <div className="text-error">
            <span className="text-sm">
              Content must be at least 10 characters
            </span>
          </div>
        ),
      };
    }

    if (content.length > 150) {
      return {
        status: "border-warning",
        extra: (
          <div className="text-warning">
            <span className="text-sm">
              {180 - content.length}/180 characters
              remaining
            </span>
          </div>
        ),
      };
    }

    return {};
  }, [content, isValidating]);

  return (
    <div>
      <FormField
        label="Title"
        extra={
          titleError && (
            <span className="text-error">
              Title must be at least 4 characters
            </span>
          )
        }
      >
        <input
          onChange={(e) =>
            editForm({ title: e.target.value })
          }
          className={`input input-bordered ${cx({
            "border-error": titleError,
          })}`}
          type="text"
          value={title}
          maxLength={40}
          placeholder="Enter a title"
        />
      </FormField>
      <FormField label="Content" extra={contentProps.extra}>
        <textarea
          value={content}
          onChange={(e) =>
            editForm({ content: e.target.value })
          }
          className={`input input-bordered ${contentProps.status} h-[160px] resize-none`}
          placeholder="Enter your content"
          maxLength={180}
        />
      </FormField>
    </div>
  );
};

const NoteForm: React.FC<NoteFormProps> = ({
  initialValues,
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

  const { mutate, isLoading } = trpc.useMutation(
    ["note.addNote"],
    {
      onSuccess: () => {
        utils.invalidateQueries(["note.getAll"]);
        resetForm();
      },
      onError: (error) => {
        console.error(error.message);
      },
    }
  );

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

      mutate(values);
    });
  };

  const { isPrivate } = values;

  return (
    <Collapse
      title={
        <button className="btn btn-link gap-2 text-accent">
          write note
        </button>
      }
      defaultOpen={false}
    >
      <NoteFields
        values={values}
        isValidating={isValidating}
        editForm={editForm}
      />
      <div className="flex justify-end w-full">
        <AddNoteButton
          isPrivate={!!isPrivate}
          setIsPrivate={(cb) => cb(!!isPrivate)}
          canNotePrivately={isAuthed}
          isDisabled={isLoading}
          onClick={handleSubmit}
        />
      </div>
    </Collapse>
  );
};

const AddNoteButton: React.FC<{
  onClick: VoidFunction;
  canNotePrivately: boolean;
  isDisabled: boolean;
  isNoted?: boolean;
  isPrivate: boolean;
  setIsPrivate: (
    cb: (isPrivate: boolean) => boolean
  ) => void;
}> = ({
  onClick,
  isNoted,
  isDisabled,
  canNotePrivately,
  isPrivate,
  setIsPrivate,
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
              setIsPrivate((prev) => !prev);
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

const FormField: React.FC<{
  label?:
    | [React.ReactNode, React.ReactNode]
    | React.ReactNode;
  extra?:
    | [React.ReactNode, React.ReactNode]
    | React.ReactNode;
  children: React.ReactNode;
}> = ({ extra, label, children }) => {
  return (
    <div className="form-control">
      {Array.isArray(label) ? (
        <label className="label">
          {label[0] && (
            <span className="label-text">{label[0]}</span>
          )}
          {label[1] && (
            <span className="label-text-alt">
              {label[1]}
            </span>
          )}
        </label>
      ) : (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      {children}
      {Array.isArray(extra) ? (
        <label className="label">
          {extra[0] && (
            <span className="label-text-alt">
              {extra[0]}
            </span>
          )}
          {extra[1] && (
            <span className="label-text-alt">
              {extra[1]}
            </span>
          )}
        </label>
      ) : (
        <label className="label h-6">
          <span className="label-text">{extra}</span>
        </label>
      )}
    </div>
  );
};

export default NoteForm;
