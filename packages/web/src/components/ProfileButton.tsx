import { signIn, signOut, useSession } from "next-auth/react";
import { FaUserCircle } from "react-icons/fa";
import Link from "next/link";

type ProfileButtonProps = {
  hasSignout?: boolean;
  extraBefore?: (isAuthed: boolean) => React.ReactNode;
};

const ProfileButton: React.FC<ProfileButtonProps> = ({
  hasSignout,
  extraBefore,
}) => {
  const { data, status } = useSession();

  if (status === "loading") {
    return <div className="min-h-12" />;
  }

  if (!data?.user) {
    return (
      <>
        {extraBefore && extraBefore(false)}
        <button
          className="btn btn-link text-accent"
          onClick={() => {
            signIn();
          }}
        >
          Sign In
        </button>
      </>
    );
  }

  if (hasSignout) {
    return (
      <>
        {extraBefore && extraBefore(true)}
        <button
          className="btn btn-link text-accent"
          onClick={() => {
            signOut();
          }}
        >
          Sign Out
        </button>
      </>
    );
  }

  return (
    <>
      {extraBefore && extraBefore(true)}
      <Link href="/profile">
        <button className="btn btn-link gap-2 text-accent">
          {data.user.name}
          <FaUserCircle />
        </button>
      </Link>
    </>
  );
};

export default ProfileButton;
