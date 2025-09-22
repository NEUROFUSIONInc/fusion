import { useContext, useEffect, useMemo, useState } from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input } from "~/components/ui";
import { categories, promptSelectionDays, responseTypes } from "~/config/data";
import { OnboardingQuestion, Prompt, PromptNotifyCondition, PromptNotifyOperator, PromptResponseType } from "~/@types";
import { TimePicker } from "./timepicker";
import dayjs from "dayjs";

interface AddPromptModalProps {
  prompt: Prompt;
  setPrompt: (prompt: Prompt) => void;
  onSave: (prompt: Prompt) => void;
  onClose: () => void;
  savedPrompts?: Prompt[];
  savedOnboardingQuestions?: OnboardingQuestion[];
}

export function getDayjsFromTimeString(timeString: string) {
  // time is in the format "HH:mm", split up and convert to a dayjs object
  const time = timeString.split(":");
  const hour = parseInt(time[0], 10);
  const minute = parseInt(time[1], 10);

  return dayjs().startOf("day").add(hour, "hour").add(minute, "minute");
}

const AddPromptModal: React.FC<AddPromptModalProps> = ({
  prompt,
  setPrompt,
  onSave,
  onClose,
  savedPrompts,
  savedOnboardingQuestions,
}) => {
  const [promptText, setPromptText] = useState(prompt.promptText);
  const [customOptions, setCustomOptions] = useState<string[]>(
    prompt.additionalMeta.customOptionText ? prompt.additionalMeta.customOptionText.split(";") : []
  );
  const [singleResponse, setSingleResponse] = useState(prompt.additionalMeta.singleResponse);
  const [responseType, setResponseType] = useState<PromptResponseType | null>(prompt.responseType);
  const [category, setCategory] = useState<string | null>(prompt.additionalMeta.category ?? null);
  const [countPerDay, setCountPerDay] = useState<number | undefined>();
  const [days, setDays] = useState(prompt.notificationConfig_days);
  const [start, setStart] = useState(getDayjsFromTimeString("08:00"));
  const [end, setEnd] = useState(getDayjsFromTimeString("22:00"));

  const [showAdvanced, setShowAdvanced] = useState(false);

  const [notifyConditions, setNotifyConditions] = useState<PromptNotifyCondition[]>(
    prompt.additionalMeta?.notifyConditions ?? []
  );

  const [numberRangeOptions, setNumberRangeOptions] = useState<{ min: number; max: number }>(
    prompt.additionalMeta?.numberRangeOptions ?? { min: 0, max: 10 }
  );
  const [numberRangeError, setNumberRangeError] = useState<string | null>(null);

  const updatePrompt = () => {
    const updatedPrompt: Prompt = {
      ...prompt,
      uuid: !prompt.uuid || prompt.uuid === "" ? crypto.randomUUID() : prompt.uuid,
      promptText,
      responseType: responseType ?? "text",
      notificationConfig_days: days,
      notificationConfig_startTime: start.format("HH:mm"),
      notificationConfig_endTime: end.format("HH:mm"),
      notificationConfig_countPerDay: countPerDay ?? 1,
      additionalMeta: {
        category: category ?? "",
        customOptionText: customOptions.join(";"),
        singleResponse: singleResponse,
        notifyConditions: notifyConditions.length > 0 ? notifyConditions : undefined,
        numberRangeOptions: responseType === "numberRange" ? numberRangeOptions : undefined,
      },
    };

    setPrompt(updatedPrompt);
    onSave(updatedPrompt);
  };

  const addNewCondition = () => {
    setNotifyConditions([
      ...notifyConditions,
      {
        sourceId: "",
        sourceType: "prompt",
        operator: PromptNotifyOperator.equals,
        value: "",
      },
    ]);
  };

  const removeCondition = (index: number) => {
    setNotifyConditions(notifyConditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<PromptNotifyCondition>) => {
    setNotifyConditions(
      notifyConditions.map((condition, i) => (i === index ? { ...condition, ...updates } : condition))
    );
  };

  const sourceList = useMemo(() => {
    let res = [];
    if (savedPrompts && savedPrompts?.length > 0) {
      res.push(
        ...savedPrompts
          .filter((p) => p.uuid !== prompt.uuid)
          .map((p) => ({
            sourceId: p.uuid,
            sourceType: "prompt",
            sourceText: p.promptText,
          }))
      );
    }
    if (savedOnboardingQuestions && savedOnboardingQuestions?.length > 0) {
      res.push(
        ...savedOnboardingQuestions.map((question) => ({
          sourceId: question.guid,
          sourceType: "onboardingQuestion",
          sourceText: question.question,
        }))
      );
    }
    return res;
  }, [savedPrompts, savedOnboardingQuestions]);

  const setNumberRangeOption = (key: "min" | "max", value: number) => {
    if (key === "min" && value >= numberRangeOptions.max) {
      setNumberRangeError("Minimum value must be less than maximum value.");
      return;
    }
    if (key === "max" && value <= numberRangeOptions.min) {
      setNumberRangeError("Maximum value must be greater than minimum value.");
      return;
    }
    setNumberRangeError(null);
    setNumberRangeOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Configure Prompt</DialogTitle>
        </DialogHeader>
        <DialogDescription className="flex-1 overflow-y-auto pr-6">
          {/* Choose Prompt Category */}
          <div className="space-y-4">
            <div className="list-disc">
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
                <option value="">Select a category</option>
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
              Response Type
              <select
                value={responseType ?? ""}
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
                  <div className="flex flex-col">
                    <label htmlFor="singleResponse" className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                      Allow multiple responses
                    </label>
                    <select
                      id="singleResponse"
                      value={singleResponse ? "no" : "yes"}
                      onChange={(e) => {
                        if (e.target.value === "yes") {
                          setSingleResponse(false);
                        } else {
                          setSingleResponse(true);
                        }
                      }}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                    >
                      <option value="yes" selected>
                        Yes
                      </option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
              )}
              {responseType === "numberRange" && (
                <div className="flex flex-col mt-2">
                  <div className="flex space-x-4">
                    {(["min", "max"] as const).map((key) => (
                      <div className="flex-1" key={key}>
                        <Input
                          label={key === "min" ? "Minimum Value" : "Maximum Value"}
                          type="number"
                          size="md"
                          fullWidth
                          value={numberRangeOptions[key]}
                          onChange={(e) => setNumberRangeOption(key, parseInt(e.target.value, 10))}
                        />
                      </div>
                    ))}
                  </div>
                  {numberRangeError && <div className="text-red-500 text-sm">{numberRangeError}</div>}
                </div>
              )}
            </label>

            {/* Add Times Component */}
            <TimePicker start={start} setStart={setStart} end={end} setEnd={setEnd} days={days} setDays={setDays} />

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg
                  className={`mr-2 h-4 w-4 transform transition-transform ${showAdvanced ? "rotate-90" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Advanced Settings
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Notify Conditions</span>
                      <Button size="sm" intent="ghost" className="underline" onClick={addNewCondition}>
                        + Add Condition
                      </Button>
                    </div>

                    {notifyConditions.map((condition, index) => (
                      <div key={index} className="mb-4 p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Condition {index + 1}</span>
                          <Button
                            size="sm"
                            intent="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeCondition(index)}
                          >
                            Remove
                          </Button>
                        </div>

                        <label
                          htmlFor={`sourceSelect-${index}`}
                          className="block text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Prompt
                        </label>
                        <select
                          id={`sourceSelect-${index}`}
                          value={condition.sourceId}
                          onChange={(e) => {
                            updateCondition(index, {
                              sourceId: e.target.value,
                              sourceType: (sourceList.find((s) => s.sourceId === e.target.value)?.sourceType ??
                                "prompt") as "prompt" | "onboardingQuestion",
                            });
                          }}
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                        >
                          <option value="">Choose a prompt or onboarding question</option>
                          {sourceList?.map((source) => (
                            <option key={source.sourceId} value={source.sourceId}>
                              {source.sourceText}
                            </option>
                          ))}
                        </select>

                        <label
                          htmlFor={`operator-${index}`}
                          className="block text-sm font-medium text-gray-900 dark:text-white mt-2"
                        >
                          Operator
                        </label>
                        <select
                          id={`operator-${index}`}
                          value={condition.operator}
                          onChange={(e) => updateCondition(index, { operator: e.target.value as PromptNotifyOperator })}
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                        >
                          <option value={PromptNotifyOperator.equals}>equals</option>
                          <option value={PromptNotifyOperator.not_equals}>not equals</option>
                          <option value={PromptNotifyOperator.greater_than}>greater than</option>
                          <option value={PromptNotifyOperator.less_than}>less than</option>
                          <option value={PromptNotifyOperator.contains}>contains</option>
                          <option value={PromptNotifyOperator.not_contains}>not contains</option>
                        </select>

                        <Input
                          label="Value"
                          id={`value-${index}`}
                          type="text"
                          value={condition.value}
                          onChange={(e) => updateCondition(index, { value: e.target.value })}
                          className="mt-2"
                          placeholder="Enter value"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogDescription>
        <div className="mt-4 flex justify-end gap-4 pt-4 border-t flex-shrink-0">
          <Button disabled={false} onClick={updatePrompt}>
            Save Prompt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPromptModal;
