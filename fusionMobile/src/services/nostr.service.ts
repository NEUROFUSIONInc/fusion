import { db } from "~/lib";

export class NostrService {
  // Create a local account & save details
  public createNostrAccount = async (
    npub: string,
    pubkey: string,
    privkey: string
  ) => {
    try {
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
      return saveAccountStatus;
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
}

export const nostrService = Object.freeze(new NostrService());
