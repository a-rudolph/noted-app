import { useMemo } from "react";
import { cx } from "../utils/classnames";
import { FormField } from "./FormField";

export type NoteValues = {
  title: string;
  content?: string;
  isPrivate: boolean;
};

export const NoteFields: React.FC<{
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
  }, [content]);

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
          className={`input input-bordered ${contentProps.status} h-20 resize-none`}
          placeholder="Enter your content"
          maxLength={180}
        />
      </FormField>
    </div>
  );
};
