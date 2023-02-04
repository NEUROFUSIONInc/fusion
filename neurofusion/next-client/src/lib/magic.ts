import { Magic } from "magic-sdk";

export const magic = typeof window !== "undefined" && new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || "a");
