import dayjs from "dayjs";
import { nip19, nip04, relayInit } from "nostr-tools";

import { api } from "~/config";

interface AuthResponse {
  userNpub: string;
  authToken: string;
}

class AuthService {
  async completeNostrLogin(publicKey: string, privateKey?: string): Promise<AuthResponse | null> {
    const serverPublicKey = process.env["NEXT_PUBLIC_FUSION_NOSTR_PUBLIC_KEY"];

    try {
      const relay = relayInit(process.env["NEXT_PUBLIC_FUSION_RELAY_URL"]!);
      relay.on("connect", () => {
        console.log(`connected to ${relay.url}`);
      });
      relay.on("error", () => {
        console.log(`failed to connect to ${relay.url}`);
      });
      await relay.connect();

      const loginTimestamp = dayjs().unix();
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
            const decoded = privateKey
              ? await nip04.decrypt(privateKey, serverPublicKey!, event.content)
              : await (window as any).nostr?.nip04.decrypt(serverPublicKey!, event.content);
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
      console.error(error);
      return null;
    }
  }
}

export const authService = Object.freeze(new AuthService());
