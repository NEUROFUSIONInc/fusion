import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

/**
 * Open the database
 * @returns {SQLite.WebSQLDatabase | SQLite.SQLiteDatabase}
 */
function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase("fusion.db");
  return db;
}
export const db = openDatabase();

export const createBaseTables = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // tx.executeSql(`DROP TABLE IF EXISTS prompt_responses;`);
      // tx.executeSql(`DROP TABLE IF EXISTS prompts;`);
      // tx.executeSql(`DROP TABLE IF EXISTS prompt_notifications;`);
      // tx.executeSql(`DELETE FROM prompt_responses;`);

      // Create prompts table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS prompts (
            uuid TEXT PRIMARY KEY,
            promptText TEXT,
            responseType TEXT,
            notificationConfig_days TEXT,
            notificationConfig_startTime TEXT,
            notificationConfig_endTime TEXT,
            notificationConfig_countPerDay INTEGER
          );`,
        [],
        (tx) => {
          // Create prompt responses table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS prompt_responses (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              promptUuid TEXT,
              triggerTimestamp INTEGER,
              responseTimestamp INTEGER,
              value TEXT,
              FOREIGN KEY (promptUuid) REFERENCES prompts(uuid)
            );`,
            [],
            (tx) => {
              // Create prompt notifications table
              tx.executeSql(
                `CREATE TABLE IF NOT EXISTS prompt_notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                promptUuid TEXT,
                notificationId TEXT,
                FOREIGN KEY (promptUuid) REFERENCES prompts(uuid)
              );`,
                [],
                () => {
                  // finished creating all the tables
                  // add "additionalMeta TEXT" column to prompts table
                  // TODO: operations like this should move to sequelize
                  tx.executeSql(
                    "PRAGMA table_info(prompts)",
                    [],
                    (tx, results) => {
                      let columnExists = false;
                      for (let i = 0; i < results.rows.length; i++) {
                        if (results.rows.item(i).name === "additionalMeta") {
                          columnExists = true;
                          break;
                        }
                      }
                      if (!columnExists) {
                        tx.executeSql(
                          "ALTER TABLE prompts ADD COLUMN additionalMeta TEXT;",
                          [],
                          (tx, results) => {
                            console.log(
                              "additionalMeta column added successfully to prompts table"
                            );
                            resolve(true);
                          }
                        );
                      } else {
                        resolve(true);
                      }
                    }
                  );

                  // add "additionalMeta TEXT" column to prompt_responses table
                  tx.executeSql(
                    "PRAGMA table_info(prompt_responses)",
                    [],
                    (tx, results) => {
                      let columnExists = false;
                      for (let i = 0; i < results.rows.length; i++) {
                        if (results.rows.item(i).name === "additionalMeta") {
                          columnExists = true;
                          break;
                        }
                      }
                      if (!columnExists) {
                        tx.executeSql(
                          "ALTER TABLE prompt_responses ADD COLUMN additionalMeta TEXT",
                          [],
                          (tx, results) => {
                            console.log(
                              "additionalMeta column added successfully to prompt_responses table"
                            );
                            resolve(true);
                          }
                        );
                      } else {
                        resolve(true);
                      }
                    }
                  );
                },
                (tx, error) => {
                  console.log("error", error);
                  reject(error);
                  return Boolean(error);
                }
              );
            },
            (tx, error) => {
              console.log("error", error);
              reject(error);
              return Boolean(error);
            }
          );
        },
        (tx, error) => {
          console.log("error", error);
          reject(error);
          return Boolean(error);
        }
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS user_account (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          npub TEXT NOT NULL UNIQUE,
          pubkey TEXT NOT NULL UNIQUE,
          privkey TEXT NOT NULL
        );`,
        [],
        (tx) => {
          resolve(true);
        },
        (tx, error) => {
          console.log("error", error);
          reject(error);
          return Boolean(error);
        }
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS top_of_mind (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          status TEXT NOT NULL,
          timestamp INTEGER NOT NULL
        );`,
        [],
        (tx) => {
          resolve(true);
        },
        (tx, error) => {
          console.log("error", error);
          reject(error);
          return Boolean(error);
        }
      );
    });
  });
};
