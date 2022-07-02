import { signIn, signOut, useSession } from "next-auth/react";

const SignInPage: React.FC = () => {
  const { data, status } = useSession();

  return (
    <div className="flex flex-col mt-6 justify-center items-center">
      <div className="text-center text-gray-700">
        <h1 className="text-3xl leading-loose">{status}</h1>
        {data?.user ? (
          <div>
            <div className="text-2xl">{data.user.name}</div>
            <button
              className="bg-blue-500 enabled:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => {
                signIn();
              }}
              className="bg-blue-500 enabled:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SignInPage;
