import { cx } from "../utils/classnames";

type TooltipProps = {
  children: React.ReactNode;
  title: React.ReactNode;
  closed?: boolean;
};

const Tooltip: React.FC<TooltipProps> = ({ children, title, closed }) => {
  return (
    <div className={cx({ tooltip: closed ?? true })} data-tip={title}>
      {children}
    </div>
  );
};

export default Tooltip;
