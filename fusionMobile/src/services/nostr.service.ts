import { generatePrivateKey, getPublicKey, nip19 } from "nostr-tools";

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
}

export const nostrService = Object.freeze(new NostrService());
