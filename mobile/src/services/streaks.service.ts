import dayjs from "dayjs";
import { Toast } from "react-native-toast-message/lib/src/Toast";

import { StreakEntry } from "~/@types";
import { db } from "~/lib";

class StreakService {
  async getStreakScore(timestamp: number) {
    try {
      // if the number is -1, change the query to getting the last streak score
      let queryString = "";
      let queryParams: any[] = [];
      if (timestamp === -1) {
        queryString = `SELECT * from streaks ORDER BY timestamp DESC LIMIT 1`;
        queryParams = [];
      } else {
        queryString = `SELECT * from streaks WHERE timestamp >= ? ORDER BY timestamp DESC LIMIT 1`;
        queryParams = [timestamp];
      }
      const getStreakScoreFromDb = () => {
        return new Promise<StreakEntry>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              queryString,
              queryParams,
              (_, { rows }) => {
                if (rows.length < 1) {
                  // eslint-disable-next-line prefer-promise-reject-errors
                  reject("no streak score found");
                  return false;
                }

                const streakValue = {
                  timestamp: rows.item(0).timestamp,
                  score: rows.item(0).score,
                } as StreakEntry;
                resolve(streakValue);
              },
              (_, error) => {
                console.log("error getting responses from db");
                reject(error);
                return false;
              }
            );
          });
        });
      };

      const streakValue = await getStreakScoreFromDb();
      return streakValue;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async setStreakScore(timestamp: number, score: number) {
    // so we want this to just save and entry in the db
    try {
      const setStreakScoreInDb = () => {
        return new Promise<void>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              `INSERT INTO streaks (timestamp, score) VALUES (?, ?)`,
              [timestamp, score],
              (_, { rows }) => {
                console.log("streak score saved", rows);
                resolve();
              },
              (_, error) => {
                console.log("error getting responses from db");
                reject(error);
                return false;
              }
            );
          });
        });
      };

      await setStreakScoreInDb();
    } catch (error) {
      console.log(error);
    }
  }

  async updateStreakScore(action: "increment" | "reset") {
    console.log("updating streak score");
    const streakEntryForDay = await this.getStreakScore(
      dayjs().startOf("day").valueOf()
    );

    console.log("streak entry for day", streakEntryForDay);

    if (!streakEntryForDay) {
      console.log("no streak entry for the day checking for last streak");
      if (action === "increment") {
        // we have to get the last streak value and increment it
        const lastStreakEntry = await this.getStreakScore(-1);
        console.log("last streak entry", lastStreakEntry);
        if (lastStreakEntry) {
          console.log("bumping streak value");
          await this.setStreakScore(
            dayjs().startOf("day").valueOf(),
            lastStreakEntry.score + 1
          );
        } else {
          console.log(
            "no entry for streaks in the db at all, setting a new value"
          );
          // only the first entry ever in the db that will likely fall under this
          await this.setStreakScore(dayjs().startOf("day").valueOf(), 1);
        }
      } else {
        await this.setStreakScore(dayjs().startOf("day").valueOf(), 0);
      }

      try {
        Toast.show({
          type: "success",
          text1: "You just extended your streak 🎉",
          text2: "Keep responding to your prompts for better insights!",
        });
      } catch (error) {
        // unsure if this will error out when user just responds from the notification
        console.log("error showing toast", error);
      }

      return true;
    } else {
      // don't do anything since the streak has already been updated for the day
      console.log(
        "Tried to update streak score for the day when it's already been set"
      );
    }
  }
}

export const streakService = new StreakService();
