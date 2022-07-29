export const Card: React.FC<{
  title?: React.ReactNode;
  children: React.ReactNode;
}> = ({ children, title }) => {
  return (
    <div className="card card-compact bg-base-300 prose">
      <div className="card-body">
        {title && (
          <>
            <div className="card-title text-2xl">
              {title}
            </div>
            <hr className="m-0" />
          </>
        )}
        {children}
      </div>
    </div>
  );
};
