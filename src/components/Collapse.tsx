import { useState } from "react";
import { AiOutlineClose, AiOutlinePlus } from "react-icons/ai";
import { cx } from "../utils/classnames";
import Tooltip from "./Tooltip";

const Collapse: React.FC<{
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen: boolean;
}> = ({ title, children, defaultOpen }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <>
      <div className="flex justify-end">
        <Tooltip title="add a note" closed={!isOpen}>
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
        </Tooltip>
      </div>
      <div
        className={`
        ${cx({
          hidden: !isOpen,
        })}`}
      >
        {children}
      </div>
    </>
  );
};

export default Collapse;
