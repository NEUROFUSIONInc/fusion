/* eslint-disable @typescript-eslint/ban-ts-comment */

import { randomBytes } from "crypto";

import { Magic } from "@magic-sdk/admin";
import NextAuth, { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { RelayPool } from "nostr-relaypool";
import { getEventHash, getSignature, generatePrivateKey, getPublicKey, nip19, nip04, relayInit } from "nostr-tools";
import axios from "axios";

const relays = ["wss://relay.usefusion.ai"];

let relayPool = new RelayPool(relays);

import { authService } from "~/services";
import dayjs from "dayjs";

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
        session.user.image = null;
        session.user.authToken = token.authToken;
      }

      return session;
    },
  },
  providers: [
    // CredentialsProvider({
    //   name: "Magic Link",
    //   credentials: {
    //     didToken: { label: "DID Token", type: "text" },
    //   },
    //   async authorize(credentials) {
    //     const didToken = credentials?.didToken || "";
    //     // validate magic DID token
    //     magic.token.validate(didToken);

    //     // fetch user metadata
    //     const metadata = await magic.users.getMetadataByToken(didToken);

    //     const { body } = await authService.completeUserLogin(metadata.email || "", didToken);

    //     // return user info
    //     return {
    //       id: randomBytes(4).toString("hex"),
    //       email: metadata.email,
    //       name: metadata.email,
    //       ...body,
    //     };
    //   },
    // }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Nostr",
      credentials: {
        privateKey: { label: "privateKey", type: "password" },
      },
      async authorize(credentials, req) {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        const privateKey = credentials!.privateKey;
        const publicKey = getPublicKey(privateKey);

        console.log("publicKey", publicKey);

        const serverPublicKey = process.env.NEXT_PUBLIC_FUSION_NOSTR_PUBLIC_KEY;
        console.log("serverPublicKey", serverPublicKey);

        // check the relay pool for event for the user
        try {
          // await crypto.ensureSecure();
          const loginTimestamp = dayjs().unix();
          console.log("loginTimestamp", loginTimestamp);

          // check the relay pool for the user's account
          let authToken: any;

          const relay = relayInit("wss://relay.usefusion.ai");
          relay.on("connect", () => {
            console.log(`connected to ${relay.url}`);
          });
          relay.on("error", () => {
            console.log(`failed to connect to ${relay.url}`);
          });
          await relay.connect();

          let sub = relay.sub([
            {
              // ids: ["be5230ede4d50912ea7d8f989209b9e70c168c8dc930b29bcf66cd8f889bd3ca"],
              authors: [serverPublicKey!],
              // kinds: [4],
              // "#p": [publicKey],
              // since: loginTimestamp,
            },
          ]);

          console.log("calling the backend api");
          // validate the nostr credentials
          const res = await fetch(`${process.env.NEXT_PUBLIC_NEUROFUSION_BACKEND_URL}/api/nostrlogin`, {
            method: "POST",
            body: JSON.stringify({ pubkey: publicKey }),
            headers: { "Content-Type": "application/json" },
          });

          await (async () => {
            return new Promise((resolve) => {
              console.log("subscribing to event");
              sub.on("event", (event) => {
                console.log("we got the event we wanted:", event);
                // console.log("decoding...");
                // const decoded = await nip04.decrypt(credentials!.privateKey, serverPublicKey!, event.content);
                // console.log("access token", decoded);
                // authToken = decoded;
                // resolve(decoded);
              });
            });
          })();

          // If no error and we have user data, return it
          if (res.ok) {
            // store the authToken in secure store;
            setTimeout(() => {
              console.log("timeout complete");
            }, 5000);

            console.log("returning authToken", authToken);

            return authToken;
          } else {
            // Return null if user data could not be retrieved
            console.log("reutrning null");
            return null;
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
  ],
};
export default NextAuth(authOptions);
