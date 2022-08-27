export const FormField: React.FC<{
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
