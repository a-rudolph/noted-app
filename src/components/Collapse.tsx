import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useState } from "react";
import { OpenClose } from "./OpenClose";
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
          <OpenClose
            isOpen={isOpen}
            onClick={() => {
              setIsOpen((isOpen) => !isOpen);
            }}
          ></OpenClose>
        </Tooltip>
      </div>
      {isOpen && <div>{children}</div>}
    </div>
  );
};

export default Collapse;
