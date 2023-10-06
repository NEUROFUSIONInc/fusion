import axios from "axios";
import dayjs from "dayjs";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import {
  generatePrivateKey,
  getPublicKey,
  nip19,
  nip04,
  relayInit,
} from "nostr-tools";

import { UserAccount } from "~/@types";
import { db } from "~/lib";

export class NostrService {
  // Create a local account & save details
  public createNostrAccount = async () => {
    try {
      // generate a new account for user
      const privkey = generatePrivateKey();

      const pubkey = getPublicKey(privkey);
      const npub = nip19.npubEncode(pubkey);

      const nostrAccount = {
        npub,
        pubkey,
        privkey,
      } as UserAccount;
      const saveAccountToDb = () => {
        return new Promise<boolean>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "INSERT INTO user_account (npub, pubkey, privkey) VALUES (?, ?, ?)",
              [npub, pubkey, privkey],
              () => {
                resolve(true);
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          });
        });
      };

      const saveAccountStatus = await saveAccountToDb();
      if (!saveAccountStatus) {
        return false;
      }

      // save info to keychain
      await SecureStore.setItemAsync(
        "activeFusionAccount",
        JSON.stringify(nostrAccount)
      );

      return nostrAccount;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  public getNostrAccount = async () => {
    try {
      const getAccountFromDb = () => {
        return new Promise<{
          npub: string;
          pubkey: string;
          privkey: string;
        } | null>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "SELECT * FROM user_account",
              [],
              (_, { rows }) => {
                if (rows._array.length === 0) {
                  resolve(null);
                } else {
                  const account = rows._array[0];
                  resolve({
                    npub: account.npub,
                    pubkey: account.pubkey,
                    privkey: account.privkey,
                  });
                }
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          });
        });
      };

      const account = await getAccountFromDb();

      // check if accountInfo is saved / save if not
      const activeFusionAccount = await SecureStore.getItemAsync(
        "activeFusionAccount"
      );
      if (!activeFusionAccount) {
        await SecureStore.setItemAsync(
          "activeFusionAccount",
          JSON.stringify(account)
        );
      }
      return account;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  public getOrCreateNostrAccount = async () => {
    try {
      const nostrAccount = await this.getNostrAccount();
      if (nostrAccount) {
        return nostrAccount;
      }
      const newNostrAccount = await this.createNostrAccount();
      if (newNostrAccount) {
        return newNostrAccount;
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  public getApiToken = async (userDetails: UserAccount) => {
    // TODO: save fetched token in secure storage & check if token is active before requesting a new one
    let serverPublicKey = "";
    let nostrRelayUrl = "";
    let fusionBackendUrl = "";
    if (Constants.expoConfig?.extra) {
      serverPublicKey = Constants.expoConfig.extra.fusionNostrPublicKey;
      nostrRelayUrl = Constants.expoConfig.extra.fusionRelayUrl;
      fusionBackendUrl = Constants.expoConfig.extra.fusionBackendUrl;
    }
    if (!serverPublicKey || !nostrRelayUrl) {
      return null;
    }

    try {
      const loginTimestamp = dayjs().unix();

      const relay = relayInit(nostrRelayUrl);
      relay.on("connect", () => {
        console.log(`connected to ${relay.url}`);
      });
      relay.on("error", () => {
        console.log(`failed to connect to ${relay.url}`);
      });
      await relay.connect();

      const sub = relay.sub([
        {
          authors: [serverPublicKey!],
          kinds: [4],
          "#p": [userDetails.pubkey],
          since: loginTimestamp,
        },
      ]);

      const res = await axios.post(
        `${fusionBackendUrl}/api/nostrlogin`,
        { pubkey: userDetails.pubkey },
        {
          headers: {
            Accept: "application/json",
            "Content-type": "application/json",
          },
        }
      );

      const authToken: string = await (async () => {
        return new Promise((resolve) => {
          sub.on("event", async (event) => {
            const decoded = await nip04.decrypt(
              userDetails.privkey,
              serverPublicKey!,
              event.content
            );
            resolve(decoded);
          });
        });
      })();

      if (res.status === 200 && authToken) {
        return authToken;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };
}

export const nostrService = Object.freeze(new NostrService());
