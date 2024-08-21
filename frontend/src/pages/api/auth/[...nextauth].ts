/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Magic } from "@magic-sdk/admin";
import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

import { randomBytes } from "crypto";

export const authOptions: NextAuthOptions = {
  secret: process.env["NEXT_AUTH_SECRET"],
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
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.authToken = user.authToken;
        token.privateKey = user.privateKey;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.authToken = token.authToken;
        session.user.privateKey = token.privateKey as string;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Nostr",
      credentials: {
        userNpub: { label: "userNpub", type: "text" },
        authToken: { label: "authToken", type: "text" },
        privateKey: { label: "privateKey", type: "password" },
      },
      async authorize(credentials, req) {
        if (credentials && credentials.userNpub && credentials.authToken) {
          const resObject: User = {
            id: randomBytes(4).toString("hex"),
            name: credentials.userNpub,
            email: "",
            image: "/images/avatar.png",
            authToken: credentials.authToken,
            privateKey: credentials.privateKey,
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
