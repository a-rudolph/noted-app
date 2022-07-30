import {
  AiOutlineClose,
  AiOutlinePlus,
} from "react-icons/ai";

export const OpenClose: React.FC<{
  isOpen: boolean;
  onClick: VoidFunction;
}> = ({ isOpen, onClick }) => {
  return (
    <button
      className="btn btn-circle btn-primary"
      onClick={onClick}
    >
      <span className="text-xl">
        {isOpen ? <AiOutlineClose /> : <AiOutlinePlus />}
      </span>
    </button>
  );
};
