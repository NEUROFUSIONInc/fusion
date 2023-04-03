/* eslint-disable @typescript-eslint/ban-ts-comment */
import { randomBytes } from "crypto";

import NextAuth, { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Magic } from "@magic-sdk/admin";
import { JWT } from "next-auth/jwt";

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
      return "/";
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
        session.user.image = null;
        session.user.authToken = token.authToken;
      }

      return session;
    },
  },

  providers: [
    CredentialsProvider({
      name: "Magic Link",
      credentials: {
        didToken: { label: "DID Token", type: "text" },
      },
      async authorize(credentials) {
        const didToken = credentials?.didToken || "";
        // validate magic DID token
        magic.token.validate(didToken);

        // fetch user metadata
        const metadata = await magic.users.getMetadataByToken(didToken);

        const { body } = await authService.completeUserLogin(metadata.email || "", didToken);

        // return user info
        return {
          id: randomBytes(4).toString("hex"),
          email: metadata.email,
          name: metadata.email,
          ...body,
        };
      },
    }),
  ],
};
export default NextAuth(authOptions);
