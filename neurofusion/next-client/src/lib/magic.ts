import { Magic } from "magic-sdk";
import { signOut } from "next-auth/react";

export const magic = typeof window !== "undefined" && new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || "a");

export const logout = async () => {
  if (!magic) throw new Error(`magic not defined`);
  await magic.user.logout();
  signOut();
};
