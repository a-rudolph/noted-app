export const cx = (classNames: Record<string, boolean | null | undefined>) => {
  return Object.keys(classNames)
    .filter((key) => classNames[key])
    .join(" ");
};
