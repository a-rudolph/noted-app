import { useTypedSession } from "./use-typed-session";

export const useAuthed = () => {
  const { status } = useTypedSession();

  return status === "authenticated";
};
