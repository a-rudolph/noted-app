import { signIn, useSession } from "next-auth/react";
import { FaUserCircle } from "react-icons/fa";
import Link from "next/link";

const ProfileButton: React.FC = () => {
  const { data, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (!data?.user) {
    return (
      <button
        className="btn btn-link text-accent"
        onClick={() => {
          signIn();
        }}
      >
        Sign In
      </button>
    );
  }

  return (
    <Link href="/profile">
      <button className="btn btn-link gap-2 text-accent">
        {data.user.name}
        <FaUserCircle />
      </button>
    </Link>
  );
};

export default ProfileButton;
