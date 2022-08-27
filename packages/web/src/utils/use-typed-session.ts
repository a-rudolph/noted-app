import type { Session as UntypedSession } from "next-auth";
import { useSession } from "next-auth/react";

type UnTypedUseSessionReturn = ReturnType<typeof useSession>;

type UserSession = Exclude<UntypedSession["user"], undefined> & {
  id?: string;
};

export type TypedSession = Omit<UntypedSession, "user"> & {
  user?: UserSession;
};

export type SessionReturnType = Omit<UnTypedUseSessionReturn, "data"> & {
  data?: TypedSession;
};

export const useTypedSession = () => {
  return useSession() as SessionReturnType;
};
