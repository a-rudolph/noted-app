import { useState } from "react";
import Collapse from "./Collapse";
import { OpenClose } from "./OpenClose";
import Tooltip from "./Tooltip";

export const NoteButton: React.FC<{
  children:
    | React.ReactNode
    | ((props: {
        setIsOpen: React.Dispatch<
          React.SetStateAction<boolean>
        >;
      }) => React.ReactNode);
  defaultOpen?: boolean;
}> = ({ children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const renderChildren = () => {
    if (typeof children === "function") {
      return children({ setIsOpen });
    }

    return children;
  };

  return (
    <div>
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
      <Collapse isOpen={isOpen}>
        {renderChildren()}
      </Collapse>
    </div>
  );
};
