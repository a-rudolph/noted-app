import { cx } from "../utils/classnames";

export const Card: React.FC<{
  title?: React.ReactNode;
  children: React.ReactNode;
  leftFlair?: "primary" | "secondary";
}> = ({ children, title, leftFlair }) => {
  const className = cx({
    "border-l-4": !!leftFlair,
    "border-l-primary": leftFlair === "primary",
    "border-l-secondary": leftFlair === "secondary",
  });

  return (
    <div
      className={`card card-compact prose bg-base-300 ${className}`}
    >
      <div className="card-body">
        {title && (
          <>
            <div className="card-title text-2xl">
              {title}
            </div>
            <hr className="m-0" />
          </>
        )}
        {children}
      </div>
    </div>
  );
};
