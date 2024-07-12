import { useContext, useEffect, useState } from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input } from "~/components/ui";
import { categories, promptSelectionDays, responseTypes } from "~/config/data";
import { Prompt, PromptResponseType } from "~/@types";
import { TimePicker } from "./timepicker";
import dayjs from "dayjs";

interface AddPromptModalProps {
  prompt: Prompt;
  setPrompt: (prompt: Prompt) => void;
  onSave: (prompt: Prompt) => void;
  onClose: () => void;
}

export function getDayjsFromTimeString(timeString: string) {
  // time is in the format "HH:mm", split up and convert to a dayjs object
  const time = timeString.split(":");
  const hour = parseInt(time[0], 10);
  const minute = parseInt(time[1], 10);

  return dayjs().startOf("day").add(hour, "hour").add(minute, "minute");
}

const AddPromptModal: React.FC<AddPromptModalProps> = ({ prompt, setPrompt, onSave, onClose }) => {
  const [promptText, setPromptText] = useState(prompt.promptText);
  const [customOptions, setCustomOptions] = useState<string[]>(
    prompt.additionalMeta.customOptionText ? prompt.additionalMeta.customOptionText.split(";") : []
  );
  const [responseType, setResponseType] = useState<PromptResponseType | null>(prompt.responseType);
  const [category, setCategory] = useState<string | null>(prompt.additionalMeta.category ?? null);
  const [countPerDay, setCountPerDay] = useState<number | undefined>();
  const [days, setDays] = useState(prompt.notificationConfig_days);
  const [start, setStart] = useState(getDayjsFromTimeString("08:00"));
  const [end, setEnd] = useState(getDayjsFromTimeString("22:00"));

  const updatePrompt = () => {
    const updatedPrompt = {
      ...prompt,
      promptText,
      responseType: responseType ?? "text", // Default to "text" if null
      notificationConfig_days: days,
      notificationConfig_startTime: start.format("HH:mm"),
      notificationConfig_endTime: end.format("HH:mm"),
      notificationConfig_countPerDay: countPerDay ?? 1, // Default to 1 if undefined
      additionalMeta: {
        category: category ?? "",
        customOptionText: customOptions.join(";"),
      }, // Initialize with an empty object
    };
    console.log("updatedPrompt", updatedPrompt);
    setPrompt(updatedPrompt);
    onSave(updatedPrompt);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Prompt</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {/* Choose Prompt Category */}
          <div className="list-disc mt-2">
            <label
              htmlFor="categorySelect"
              className="my-2 block text-sm font-medium text-gray-900 dark:text-white mt-4"
            >
              Category
            </label>
            <select
              id="categorySelect"
              value={category!}
              onChange={(e) => {
                const selectedCategory = e.target.value;
                setCategory(selectedCategory);
                console.log("Selected category: ", selectedCategory);
              }}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((item, index) => (
                <option key={index} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prompt Details Component - Text, Response Type, */}
          <div className="mt-4">
            <Input
              label="Prompt Text"
              type="text"
              size="md"
              fullWidth
              placeholder="eg : are you feeling energetic"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
          </div>

          <label htmlFor="activity" className="my-2 block text-sm font-medium text-gray-900 dark:text-white mt-4">
            Response Type:
            <select
              value={responseType}
              onChange={(e) => {
                setResponseType(e.target.value as PromptResponseType);
              }}
              id="activity"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
            >
              <option value="" disabled>
                Select a response type
              </option>
              {responseTypes.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {/* TODO: Add Custom Options Component */}
            {responseType === "customOptions" && (
              <div>
                <Input
                  label="Custom Options"
                  type="text"
                  size="md"
                  fullWidth
                  placeholder="eg: Good;Bad;Neutral"
                  value={customOptions.join(";")}
                  onChange={(e) => setCustomOptions(e.target.value.split(";"))}
                />

                <div className="flex flex-wrap gap-2 mt-2">
                  {customOptions.map((option, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-800"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </label>

          {/* Add Times Component */}
          <TimePicker start={start} setStart={setStart} end={end} setEnd={setEnd} days={days} setDays={setDays} />
        </DialogDescription>
        <div className="mt-4 flex justify-end gap-4">
          <Button disabled={false} onClick={updatePrompt}>
            Save Prompt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPromptModal;
