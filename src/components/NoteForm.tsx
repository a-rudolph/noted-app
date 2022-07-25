import { trpc } from "../utils/trpc";
import { useMemo, useState } from "react";
import { cx } from "../utils/classnames";
import { useSession } from "next-auth/react";
import { FaBookOpen, FaLock } from "react-icons/fa";

const NoteForm: React.FC<{ onSubmit: VoidFunction }> = ({ onSubmit }) => {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { status } = useSession();

  const isAuthed = status === "authenticated";

  const { mutate, isLoading: isSubmitting } = trpc.useMutation(
    ["note.addNote"],
    {
      onSuccess: () => {
        onSubmit();
        setHasSubmitted(true);
        setIsValidating(false);
        setTitle("");
        setContent("");
      },
      onError: (error) => {
        console.error(error.message);
      },
    }
  );

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
              {180 - content.length}/180 characters remaining
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
          onChange={(e) => setTitle(e.target.value)}
          className={`input input-bordered ${cx({
            "border-error": titleError,
          })}`}
          type="text"
          value={title}
          maxLength={20}
          placeholder="Enter a title"
        />
      </FormField>
      <FormField label="Content" extra={contentProps.extra}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`input input-bordered ${contentProps.status} h-[160px] resize-none`}
          placeholder="Enter your content"
          maxLength={180}
        />
      </FormField>
      <div className="flex justify-end w-full">
        <AddNoteButton
          canNotePrivately={isAuthed}
          className={cx({
            "mt-[-20px]": Boolean(contentProps.extra),
          })}
          isDisabled={isSubmitting || hasSubmitted}
          isNoted={hasSubmitted}
          onClick={(isPrivate) => {
            setIsValidating(true);
            mutate({
              title,
              content,
              isPrivate,
            });
          }}
        />
      </div>
    </div>
  );
};

const AddNoteButton: React.FC<{
  onClick: (isPrivate: boolean) => void;
  canNotePrivately: boolean;
  isDisabled: boolean;
  isNoted: boolean;
  className: string;
}> = ({ onClick, className, isNoted, isDisabled, canNotePrivately }) => {
  const [isPrivate, setIsPrivate] = useState(false);

  if (isNoted) {
    return (
      <button
        className={`btn btn-primary w-40 ${className}`}
        disabled={isDisabled}
      >
        <div className="text-center text-primary">Noted!</div>
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
        className={`btn ${btnTheme} w-40 ${className}`}
        disabled={isDisabled}
        onClick={() => onClick(false)}
      >
        <div className="text-center flex gap-4 items-center">
          <span className="text-sm">Post Note</span>
          <FaBookOpen />
        </div>
      </button>
    );
  }

  return (
    <div className={`flex items-center w-40 ${className}`}>
      <button
        className={`btn ${btnTheme} rounded-r-none`}
        disabled={isDisabled}
        onClick={() => onClick(isPrivate)}
      >
        {isPrivate && <div className="text-center">Save Note</div>}
        {isPrivate || <div className="text-center">Post Note</div>}
      </button>
      {canNotePrivately && (
        <div className="tooltip" data-tip="toggle privacy">
          <button
            disabled={isDisabled}
            onClick={() => {
              setIsPrivate((prev) => !prev);
            }}
            className={`btn ${btnTheme} rounded-l-none`}
          >
            {isPrivate ? <FaLock /> : <FaBookOpen />}
          </button>
        </div>
      )}
    </div>
  );
};

const FormField: React.FC<{
  label?: [React.ReactNode, React.ReactNode] | React.ReactNode;
  extra?: [React.ReactNode, React.ReactNode] | React.ReactNode;
  children: React.ReactNode;
}> = ({ extra, label, children }) => {
  return (
    <div className="form-control">
      {Array.isArray(label) ? (
        <label className="label">
          {label[0] && <span className="label-text">{label[0]}</span>}
          {label[1] && <span className="label-text-alt">{label[1]}</span>}
        </label>
      ) : (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      {children}
      {Array.isArray(extra) ? (
        <label className="label">
          {extra[0] && <span className="label-text-alt">{extra[0]}</span>}
          {extra[1] && <span className="label-text-alt">{extra[1]}</span>}
        </label>
      ) : (
        <label className="label">
          <span className="label-text">{extra}</span>
        </label>
      )}
    </div>
  );
};

export default NoteForm;
