import dayjs from "dayjs";
import { UserCompleteLoginResponse } from "./types";

import { api } from "~/config";

import { nip19, nip04, relayInit, getPublicKey } from "nostr-tools";

class AuthService {
  async completeUserLogin(userEmail: string, magicLinkAuthToken: string) {
    const response = await api.post<UserCompleteLoginResponse>("/userlogin", { userEmail, magicLinkAuthToken });

    return response.data;
  }

  async completeNostrLogin(privateKey: string) {
    const publicKey = getPublicKey(privateKey);
    const serverPublicKey = process.env.NEXT_PUBLIC_FUSION_NOSTR_PUBLIC_KEY;

    try {
      // await crypto.ensureSecure();
      const loginTimestamp = dayjs().unix();
      console.log("loginTimestamp", loginTimestamp);

      const relay = relayInit(process.env.NEXT_PUBLIC_FUSION_RELAY_URL!);
      relay.on("connect", () => {
        console.log(`connected to ${relay.url}`);
      });
      relay.on("error", () => {
        console.log(`failed to connect to ${relay.url}`);
      });
      await relay.connect();

      let sub = relay.sub([
        {
          authors: [serverPublicKey!],
          kinds: [4],
          "#p": [publicKey],
          since: loginTimestamp,
        },
      ]);

      const res = await api.post(`/nostrlogin`, { pubkey: publicKey });
      const authToken: string = await (async () => {
        return new Promise((resolve) => {
          sub.on("event", async (event) => {
            console.log("we got the event we wanted:", event);
            const decoded = await nip04.decrypt(privateKey, serverPublicKey!, event.content);
            resolve(decoded);
          });
        });
      })();

      if (res.status == 200 && authToken) {
        return {
          userNpub: nip19.npubEncode(publicKey),
          authToken: authToken,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export const authService = Object.freeze(new AuthService());
