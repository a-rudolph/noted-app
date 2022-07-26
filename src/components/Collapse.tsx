import { useState } from "react";
import { AiOutlineClose, AiOutlinePlus } from "react-icons/ai";
import { cx } from "../utils/classnames";

const Collapse: React.FC<{
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen: boolean;
}> = ({ title, children, defaultOpen }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <>
      <div className="flex justify-end">
        <button
          className="btn btn-circle btn-primary"
          onClick={() => {
            setIsOpen((isOpen) => !isOpen);
          }}
        >
          <span className="text-xl">
            {isOpen ? <AiOutlineClose /> : <AiOutlinePlus />}
          </span>
        </button>
      </div>
      <div
        tabIndex={0}
        className={`collapse ${cx({
          "collapse-open": isOpen,
          "collapse-close": !isOpen,
        })}`}
      >
        <div className="collapse-content">{children}</div>
      </div>
    </>
  );
};

export default Collapse;
