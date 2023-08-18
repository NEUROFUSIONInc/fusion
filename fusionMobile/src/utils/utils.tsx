import dayjs from "dayjs";
import * as Crypto from "expo-crypto";
import "react-native-get-random-values";

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { promptFrequencyData } from "../components/timepicker/data";

import { appInsights } from "./appInsights";

import { Days, NotificationConfigDays } from "~/@types";

/**
 * Helper functions
 */
export const updateTimestampToMs = (unixTimestamp: string | number) => {
  /**
   * Converts unix timestamp to milliseconds
   */
  if (typeof unixTimestamp === "string") {
    unixTimestamp = parseInt(unixTimestamp, 10);
  }
  if (unixTimestamp.toString().length === 10) {
    return unixTimestamp * 1000;
  }
  return unixTimestamp;
};

export const convertTime = (time24: string) => {
  /**
   * Converts 24 hour time to 12 hour time
   */
  let hour = parseInt(time24.substring(0, 2), 10);
  const minute = time24.substring(3, 5);
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${suffix}`;
};

export function getEvenlySpacedTimes(
  startTime: string,
  endTime: string,
  count: number
) {
  /**
   * Returns an array of (count) notifications based on available times
   */
  const start = getDayjsFromTimeString(startTime);
  const end = getDayjsFromTimeString(endTime);
  const max = count + 1;

  // Calculate the total duration between the two times in milliseconds
  const duration = end.diff(start);

  // Calculate the duration between each of the four evenly spaced times in milliseconds
  const interval = duration / max;

  // Calculate and display the four evenly spaced times between the start and end times
  const times: string[] = [];
  for (let i = 1; i < max; i++) {
    const time = start.add(interval * i);
    const timeString = time.format("HH:mm");
    times.push(timeString);
  }

  return times;
}

export function calculateContactCount(
  startTime: dayjs.Dayjs,
  endTime: dayjs.Dayjs,
  frequency: string
): number {
  if (frequency === "1") {
    return 1;
  }

  const durationMinutes = endTime.diff(startTime, "minute");
  const frequencyMinutes = parseInt(frequency, 10);

  // Calculate the number of contacts within the specified time range
  let contactCount = Math.floor(durationMinutes / frequencyMinutes);

  // Adjust the contact count if the last contact exceeds the end time
  const lastContactTime = startTime.add(
    contactCount * frequencyMinutes,
    "minute"
  );
  if (lastContactTime.isAfter(endTime) || lastContactTime.isSame(endTime)) {
    contactCount--;
  }

  return contactCount >= 0 ? contactCount : 0;
}

export function getDayjsFromTimeString(timeString: string) {
  // time is in the format "HH:mm", split up and convert to a dayjs object
  const time = timeString.split(":");
  const hour = parseInt(time[0], 10);
  const minute = parseInt(time[1], 10);

  return dayjs().startOf("day").add(hour, "hour").add(minute, "minute");
}

export function getFrequencyLabel(
  startTime: string,
  endTime: string,
  contactCount: number
): string {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  const durationMinutes = endMinutes - startMinutes;

  if (getEvenlySpacedTimes(startTime, endTime, contactCount).length === 1) {
    return "Once";
  }

  // not length but total minutes
  let frequencyValue: string = "";
  for (const option of promptFrequencyData) {
    const frequencyMinutes = parseInt(option.value as string, 10);
    const calculatedMinutesStep = Math.floor(
      durationMinutes / (contactCount + 1) // +1 because we excluded the start time earlier
    );
    if (frequencyMinutes >= calculatedMinutesStep) {
      frequencyValue = option.label as string;
      break;
    }
  }

  if (frequencyValue) {
    return frequencyValue;
  }

  return "";
}

export function interpretDaySelection(days: NotificationConfigDays): string {
  const selectedDays = Object.keys(days).filter((day) => days[day as Days]);
  const numSelectedDays = selectedDays.length;

  if (numSelectedDays === 0) {
    return "Please select at least one day";
  }

  if (numSelectedDays === 7) {
    return "Everyday";
  }

  if (numSelectedDays === 1) {
    const selectedDay = selectedDays[0];
    return `Only ${selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}`;
  }

  if (
    selectedDays.includes("saturday") &&
    selectedDays.includes("sunday") &&
    numSelectedDays === 2
  ) {
    return "Weekends";
  }

  if (
    numSelectedDays === 5 &&
    !selectedDays.includes("saturday") &&
    !selectedDays.includes("sunday")
  ) {
    return "Weekdays";
  }

  const consecutiveDays = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const firstSelectedDayIndex = consecutiveDays.findIndex((day) =>
    selectedDays.includes(day)
  );

  const consecutiveSelectedDays = consecutiveDays.slice(
    firstSelectedDayIndex,
    firstSelectedDayIndex + numSelectedDays
  );

  const allConsecutiveSelected = consecutiveSelectedDays.every((day) =>
    selectedDays.includes(day)
  );

  if (allConsecutiveSelected) {
    const startDay = consecutiveSelectedDays[0];
    const endDay = consecutiveSelectedDays[numSelectedDays - 1];
    return `${startDay.charAt(0).toUpperCase() + startDay.slice(1, 3)} to ${
      endDay.charAt(0).toUpperCase() + endDay.slice(1, 3)
    }`;
  }

  if (consecutiveSelectedDays.length === numSelectedDays) {
    return selectedDays
      .map((day) => day.charAt(0).toUpperCase() + day.charAt(1))
      .join(", ");
  }

  return "No specific pattern found";
}

// not sure we need this anymore... we will derive the value from getFrequencyLabel
export function getFrequencyFromCount(
  startTime: dayjs.Dayjs,
  endTime: dayjs.Dayjs,
  totalCount: number
) {
  const durationMinutes = endTime.diff(startTime, "minute");

  let closestFrequency = promptFrequencyData[0].value as string;
  let closestDifference = Infinity;

  // Iterate through the frequency options and find the closest one based on the total count
  for (const option of promptFrequencyData) {
    const frequencyMinutes = parseInt(option.value as string, 10);
    const contactCount = Math.floor(durationMinutes / frequencyMinutes);
    const difference = Math.abs(contactCount - totalCount);

    if (difference < closestDifference) {
      closestFrequency = option.value as string;
      closestDifference = difference;
    }
  }

  return closestFrequency;
}

/**
 * End of time related functions
 */

export async function maskPromptId(promptId: string) {
  /**
   * Basically takes a prompt ID and generates a hashed version to be stored for analytics.
   *
   */
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    promptId
  );

  return hash;
}

export async function saveFileToDevice(
  fileName: string,
  fileContents: string,
  exportFile: boolean = false
) {
  /**
   * Takes file content and saves it to the local directory of user device.
   *
   * If exportFile is true, we also export to external path for user.
   * @param fileName - name of the file to be saved
   */
  try {
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, fileContents);
    if (exportFile) {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        alert("Sharing is not available on this device");
        return;
      }
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Your fusion data",
        UTI: "public.comma-separated-values-text",
      });
    }

    appInsights.trackEvent({ name: "data_export" });

    return fileUri;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function convertValueToNumber(value: string | number) {
  /**
   * Takes a string and converts it to a number
   */

  // People will have a lot of stuff in here but we just need the number first
  if (typeof value === "number") {
    return value;
  }

  if (value === "") {
    return null;
  }

  // use regex to get the first set of numbers before any other characters
  const regex = /^-?\d+/;
  const match = value.match(regex);
  if (!match) {
    return null;
  }

  return Number(match[0]);
}

// export async function exportFileDirectoryAsZip(
//   filePaths: string[],
//   zipFilename: string
// ) {
//   /**
//    * Takes a set of files and zips them together into a single .zip
//    *
//    * Currently ios doesn't handle the type well in the share menu
//    * but will need to fix this soon
//    */
//   try {
//     const targetPath = `${FileSystem.documentDirectory}${zipFilename}`;
//     const zipPath = await zip(filePaths, targetPath);

//     console.log(`${zipPath}`);
//     if (zipPath) {
//       const isAvailable = await Sharing.isAvailableAsync();
//       if (!isAvailable) {
//         alert("Sharing is not available on this device");
//         return;
//       }
//       await Sharing.shareAsync(filePaths[0], {
//         mimeType: "application/zip",
//         dialogTitle: "Your fusion data",
//         UTI: "com.pkware.zip-archive",
//       });
//     } else {
//       console.log("zipPath is null");
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }
