import { Button, Dialog, DialogContent, DialogDescription, DialogTitle, Input } from "~/components/ui";
import { useContext, useEffect, useState } from "react";
import { NotificationConfigDays } from "~/@types";
import dayjs from "dayjs";
import { promptFrequencyData, promptSelectionDays } from "~/config/data";
import { getDayjsFromTimeString } from "./utils";

export type TimePickerProps = {
  start: dayjs.Dayjs;
  setStart: (time: dayjs.Dayjs) => void;
  end: dayjs.Dayjs;
  setEnd: (time: dayjs.Dayjs) => void;
  days?: NotificationConfigDays;
  setDays: (days: NotificationConfigDays) => void;
  setPromptCount?: (count: number) => void;
  defaultPromptFrequencyLabel?: string | null;
};

export const TimePicker: React.FC<TimePickerProps> = ({
  start,
  setStart,
  end,
  setEnd,
  days = promptSelectionDays,
  setDays,
  setPromptCount,
  defaultPromptFrequencyLabel,
}) => {
  const [frequency, setFrequency] = useState("1");

  // support for choosing a single time
  const [isSingleTime, setIsSingleTime] = useState(false);
  useEffect(() => {
    if (frequency === "1") {
      setIsSingleTime(true);
      setEnd(start.add(2, "minute"));
    } else {
      setIsSingleTime(false);
    }
  }, [frequency, start]);

  return (
    <>
      <div className="mt-2">
        <label htmlFor="frequency" className="block text-sm font-medium text-gray-900 dark:text-white mt-4">
          How often should we prompt participants?
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            id="frequency"
            className="block w-full mt-2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          >
            {promptFrequencyData.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="time" className="block text-sm font-medium text-gray-900 dark:text-white mt-4">
          When do you want to prompt participants?
        </label>
        <div className="mt-2">
          <label>{isSingleTime ? "At" : "Between"}</label>
          <input
            type="time"
            id="time"
            value={start.format("HH:mm")}
            onChange={(e) => setStart(getDayjsFromTimeString(e.target.value))}
            className="block w-full mt-2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          />
        </div>

        {!isSingleTime && (
          <div className="mt-2">
            <label>And</label>
            <input
              type="time"
              id="time"
              value={end.format("HH:mm")}
              onChange={(e) => setEnd(getDayjsFromTimeString(e.target.value))}
              className="block w-full mt-2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
            />
          </div>
        )}

        <label className="block text-sm font-medium text-gray-900 dark:text-white mt-6">
          Which days do you want this on?
          <div className="flex flex-wrap mt-4 gap-2">
            {Object.keys(promptSelectionDays).map((day_string) => (
              <div key={day_string} className="flex items-center">
                <input
                  type="checkbox"
                  id={day_string}
                  value={day_string}
                  checked={days[day_string as keyof typeof days]}
                  onChange={() => setDays({ ...days, [day_string]: !days[day_string as keyof typeof days] })}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor={day_string} className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                  {day_string.charAt(0).toUpperCase() + day_string.slice(1)}
                </label>
              </div>
            ))}
          </div>
        </label>
      </div>
    </>
  );
};
