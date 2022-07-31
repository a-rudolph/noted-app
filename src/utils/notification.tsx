import ReactDOM from "react-dom";
import { AiOutlineClose } from "react-icons/ai";
import { FaExclamation, FaUndoAlt } from "react-icons/fa";

export const Notification: React.FC<{
  message: string;
  onClose: VoidFunction;
  onUndo: VoidFunction;
}> = ({ message, onClose, onUndo }) => {
  return ReactDOM.createPortal(
    <div className="card pointer-events-auto shadow-lg flex-col w-60 relative rounded overflow-hidden">
      <div className="flex justify-between items-center bg-slate-700 w-full pl-4">
        <div>{message}</div>
        <button
          className="btn btn-link text-error"
          onClick={onUndo}
        >
          <div className="w-full flex items-center gap-2">
            <span className="text-sm">undo</span>
            <FaUndoAlt />
          </div>
        </button>
      </div>
      <div className="w-full bg-base-100 rounded absolute bottom-0">
        <div className="w-full origin-left scale-x-0 animate-undo h-1 bg-error rounded" />
      </div>
    </div>,
    document.getElementById("notification-layer") ||
      document.body
  );
};

const Error: React.FC<{
  message: string;
  onClose: VoidFunction;
}> = ({ message, onClose }) => {
  return ReactDOM.createPortal(
    <div className="alert alert-error pointer-events-auto z-50 w-[360px] rounded-sm opacity-80">
      <div className="flex gap-2 items-start ">
        <span className="p-2">
          <FaExclamation />
        </span>
        <span>{message}</span>
      </div>
      <button
        className="hover:text-base-300"
        onClick={onClose}
      >
        <span className="text-lg">
          <AiOutlineClose />
        </span>
      </button>
    </div>,
    document.getElementById("notification-layer") ||
      document.body
  );
};

const notification = (message: string) => {
  const root = document.getElementById(
    "notification-layer"
  );

  if (!root) {
    console.error("No root element found");
    return;
  }

  const notification = document.createElement("div");

  const onClose = () => {
    ReactDOM.unmountComponentAtNode(notification);
    root.removeChild(notification);
  };

  ReactDOM.render(
    <Error onClose={onClose} message={message} />,
    notification
  );

  root.appendChild(notification);

  setTimeout(() => {
    try {
      root.removeChild(notification);
    } catch (e) {
      console.error(e);
    }
  }, 5000);
};
