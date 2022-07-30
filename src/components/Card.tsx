import { useAutoAnimate } from "@formkit/auto-animate/react";
import { AiOutlineClose } from "react-icons/ai";
import { cx } from "../utils/classnames";
import { Button } from "./Button";

export const Card: React.FC<{
  title?: React.ReactNode;
  children: React.ReactNode;
  leftFlair?: "primary" | "secondary";
  onClose?: VoidFunction | false;
}> = ({ children, title, leftFlair, onClose }) => {
  const className = cx({
    "border-l-4": !!leftFlair,
    "border-l-primary": leftFlair === "primary",
    "border-l-secondary": leftFlair === "secondary",
  });

  const [animateParent] = useAutoAnimate<HTMLDivElement>();

  return (
    <div
      className={`card card-compact prose bg-base-300 ${className}`}
    >
      <div ref={animateParent} className="card-body">
        {onClose && (
          <Button
            className="absolute top-0 right-0 text-lg text-base-content"
            link={true}
            type="primary"
            onClick={onClose}
          >
            <AiOutlineClose />
          </Button>
        )}
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
