import { cx } from "../utils/classnames";

export const Button: React.FC<
  {
    children: React.ReactNode;
    type?: "primary" | "secondary" | "accent" | "error";
    link?: boolean;
    isLoading?: boolean;
    shape?: "circle" | "square";
  } & React.HTMLAttributes<HTMLButtonElement>
> = ({
  children,
  type,
  link,
  isLoading,
  className,
  shape,
  ...props
}) => {
  const theme = cx({
    "btn-primary": type === "primary",
    "btn-secondary": type === "secondary",
    "btn-accent": type === "accent",
    "btn-error": type === "error",
    "btn-circle": shape === "circle",
    "btn-square": shape === "square",
    "btn-link": link,
    "opacity-80 hover:opacity-100": link,
    loading: isLoading,
  });

  const linkTheme = link
    ? cx({
        "text-primary": type === "primary",
        "text-secondary": type === "secondary",
        "text-accent": type === "accent",
        "text-error": type === "error",
      })
    : "";

  return (
    <button
      className={`btn ${theme} opa ${linkTheme} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
