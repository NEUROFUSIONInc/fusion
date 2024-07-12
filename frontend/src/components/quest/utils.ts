import dayjs from "dayjs";

export function getDayjsFromTimeString(timeString: string) {
  // time is in the format "HH:mm", split up and convert to a dayjs object
  const time = timeString.split(":");
  const hour = parseInt(time[0], 10);
  const minute = parseInt(time[1], 10);

  return dayjs().startOf("day").add(hour, "hour").add(minute, "minute");
}
