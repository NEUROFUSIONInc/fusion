import NextAuth, { NextAuthOptions } from "next-auth";
import { randomBytes } from "crypto";
import CredentialsProvider from "next-auth/providers/credentials";
import { Magic } from "@magic-sdk/admin";

const magic = new Magic(process.env.MAGIC_SECRET_KEY);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXT_AUTH_SECRET,
  session: {
    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    // override signIn page so we can integrate with Magic
    signIn: "/auth/login",
  },
  callbacks: {
    async redirect() {
      return "/";
    },
    async session({ session }) {
      session.user!.image = null;
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

        // return user info
        return {
          id: randomBytes(4).toString("hex"),
          email: metadata.email,
          name: metadata.email,
        };
      },
    }),
  ],
};
export default NextAuth(authOptions);
