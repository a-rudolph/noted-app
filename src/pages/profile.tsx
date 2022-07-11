import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";

const SignInPage: NextPage = () => {
  const { data, status } = useSession();

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex justify-end w-full">
        {data?.user ? (
          <button
            className="btn btn-link text-sky-400/75"
            onClick={() => {
              signOut();
            }}
          >
            Sign Out
          </button>
        ) : (
          <button
            className="btn btn-link text-sky-400/75"
            onClick={() => {
              signIn();
            }}
          >
            Sign In
          </button>
        )}
      </div>
      <div className="text-center">
        <h1 className="text-3xl leading-loose">{status}</h1>
        {data?.user && <div className="text-2xl">{data.user.name}</div>}
      </div>
    </div>
  );
};

export default SignInPage;
