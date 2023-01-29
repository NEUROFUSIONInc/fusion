import type { NextPage } from "next";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Magic } from "magic-sdk";

import { Button } from "~/components/ui";

const magic = typeof window !== "undefined" && new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || "a");

const Home: NextPage = () => {
  const { data: session } = useSession();
  return (
    <div className="p-2">
      <Image src="/images/logo.png" alt="Neurofusion Logo" width={80} height={80} />
      {session ? (
        <>
          <h1>Welcome {session.user?.email}</h1>
          <Button
            onClick={async () => {
              if (!magic) throw new Error(`magic not defined`);
              await magic.user.logout();
              signOut();
            }}
          >
            Logout
          </Button>
        </>
      ) : (
        <Link href="/auth/login">Login</Link>
      )}
      <Link href="/lab" className="block">
        Go to protected lab route
      </Link>

      <Link href="/recordings" className="block">
        Go to another protected route (Recordings)
      </Link>
    </div>
  );
};

export default Home;