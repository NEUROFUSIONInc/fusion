/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Magic } from "@magic-sdk/admin";
import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

import { randomBytes } from "crypto";

import { authService } from "~/services";

const magic = new Magic(process.env.MAGIC_SECRET_KEY);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXT_AUTH_SECRET,
  session: {
    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 30 * 24 * 60 * 60, // 30 days
    strategy: "jwt",
  },
  pages: {
    // override signIn page so we can integrate with Magic
    signIn: "/auth/login",
  },
  callbacks: {
    async redirect() {
      return "/playground";
    },
    async jwt({ token, user }) {
      if (user) {
        token.authToken = user.authToken;
      }
      return token;
    },
    // @ts-ignore
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.authToken = token.authToken;
      }
      if (session.user) return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Nostr",
      credentials: {
        privateKey: { label: "privateKey", type: "password" },
      },
      async authorize(credentials, req) {
        const authObject = await authService.completeNostrLogin(credentials!.privateKey);

        if (authObject) {
          const resObject: User = {
            id: randomBytes(4).toString("hex"),
            name: authObject?.userNpub,
            email: "",
            image: "/images/avatar.png",
            authToken: authObject?.authToken,
          };

          return resObject;
        } else {
          return null;
        }
      },
    }),
  ],
};
export default NextAuth(authOptions);
