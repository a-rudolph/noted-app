import { useAutoAnimate } from "@formkit/auto-animate/react";

const Collapse: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
}> = ({ children, isOpen }) => {
  const [animateParent] = useAutoAnimate<HTMLDivElement>();

  return (
    <div ref={animateParent}>
      {isOpen && <div>{children}</div>}
    </div>
  );
};

export default Collapse;
