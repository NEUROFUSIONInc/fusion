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
                  resolve(true);
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
    });
  });
};
