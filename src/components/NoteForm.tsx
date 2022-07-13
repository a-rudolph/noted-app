import { trpc } from "../utils/trpc";
import { useMemo, useState } from "react";

const NoteForm: React.FC<{ onSubmit: VoidFunction }> = ({ onSubmit }) => {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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

  const cx = (classNames: Record<string, boolean | null | undefined>) => {
    return Object.keys(classNames)
      .filter((key) => classNames[key])
      .join(" ");
  };

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
        <button
          className={`btn btn-primary ${cx({
            "mt-[-20px]": Boolean(contentProps.extra),
          })}`}
          disabled={isSubmitting || hasSubmitted}
          onClick={() => {
            setIsValidating(true);
            mutate({
              title,
              content,
            });
          }}
        >
          {hasSubmitted ? (
            <div className="text-center text-primary">Noted!</div>
          ) : (
            <div className="text-center">Add Note</div>
          )}
        </button>
      </div>
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
