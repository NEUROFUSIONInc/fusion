import type { NextPage } from "next";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

import { MainLayout } from "~/components/layouts";
import { Button } from "~/components/ui";
import { magic } from "~/lib/magic";

const Home: NextPage = () => {
  const { data: session } = useSession();

  return (
    <MainLayout>
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
      <div className="min-h-screen" />
    </MainLayout>
  );
};

(Home as any).theme = "dark";

export default Home;
