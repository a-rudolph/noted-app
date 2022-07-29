import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useState } from "react";
import {
  AiOutlineClose,
  AiOutlinePlus,
} from "react-icons/ai";
import Tooltip from "./Tooltip";

const Collapse: React.FC<{
  title?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen: boolean;
}> = ({ children, defaultOpen }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [animateParent] = useAutoAnimate<HTMLDivElement>();

  return (
    <div ref={animateParent}>
      <div className="flex justify-end">
        <Tooltip title="add a note" closed={!isOpen}>
          <button
            className="btn btn-circle btn-primary"
            onClick={() => {
              setIsOpen((isOpen) => !isOpen);
            }}
          >
            <span className="text-xl">
              {isOpen ? (
                <AiOutlineClose />
              ) : (
                <AiOutlinePlus />
              )}
            </span>
          </button>
        </Tooltip>
      </div>
      {isOpen && <div>{children}</div>}
    </div>
  );
};

export default Collapse;
