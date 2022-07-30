import ReactDOM from "react-dom";
import { AiOutlineClose } from "react-icons/ai";
import { FaExclamation } from "react-icons/fa";

const Notification: React.FC<{
  message: string;
  onClose: VoidFunction;
}> = ({ message, onClose }) => {
  return (
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
    </div>
  );
};

export const notification = (message: string) => {
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
    <Notification onClose={onClose} message={message} />,
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
