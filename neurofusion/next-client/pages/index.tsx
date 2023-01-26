"use client";

import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Magic } from "magic-sdk";

const magic =
  typeof window !== "undefined" &&
  new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || "a");

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  return (
    <div className="p-2">
      <Image
        src="/images/logo.png"
        alt="Neurofusion Logo"
        width={80}
        height={80}
      />
      {session ? (
        <>
          <h1>Welcome {session.user?.email}</h1>
          <button
            onClick={async () => {
              if (!magic) throw new Error(`magic not defined`);
              await magic.user.logout();
              signOut();
            }}
            className="py-1 px-4 bg-gray-900 text-zinc-50 rounded-md"
          >
            Logout
          </button>
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
