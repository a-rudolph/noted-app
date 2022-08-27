import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ProfileButton from "../components/ProfileButton";

const SignInPage: NextPage = () => {
  const { data, status } = useSession();

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex justify-end w-full">
        <Link href="/">
          <button className="btn btn-link text-accent">Home</button>
        </Link>
        {data?.user && (
          <Link href="/my-notes">
            <button className="btn btn-link text-accent">My Notes</button>
          </Link>
        )}
        <ProfileButton hasSignout />
      </div>
      <div className="text-center">
        <h1 className="text-3xl leading-loose">{status}</h1>
        {data?.user && <div className="text-2xl">{data.user.name}</div>}
      </div>
    </div>
  );
};

export default SignInPage;
