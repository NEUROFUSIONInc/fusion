import { Dispatch, FC, SetStateAction, useCallback, useState } from "react";
import { Text, View } from "react-native";

import { Input } from "../../input";
import { Select } from "../../select";
import { Tag } from "../../tag";

import { PromptResponseType } from "~/@types";
import { categories } from "~/config";

interface PromptDetailsStepProps {
  promptText: string;
  setPromptText: Dispatch<SetStateAction<string>>;
  responseType: PromptResponseType | null;
  setResponseType: Dispatch<SetStateAction<PromptResponseType | null>>;
  customOptions: string[];
  setCustomOptions: Dispatch<SetStateAction<string[]>>;
  category: string | null;
  setCategory?: Dispatch<SetStateAction<string | null>>;
  isCreating?: boolean;
}

export const PromptDetailsStep: FC<PromptDetailsStepProps> = ({
  promptText,
  setPromptText,
  responseType,
  setResponseType,
  customOptions,
  setCustomOptions,
  category,
  setCategory,
  isCreating = true,
}) => {
  const [customOptionsText, setCustomOptionsText] = useState(
    customOptions.join(";")
  );

  useCallback(() => {
    setCustomOptionsText(customOptions.join(";"));
  }, [customOptions]);

  const handleCustomOptionChange = (text: string) => {
    setCustomOptionsText(text);
    const arr = text
      .split(" ")
      .join("")
      .split(";")
      .filter((str) => str !== "");
    setCustomOptions(arr); // semicolon separated parsing into CustomOptions List
  };

  return (
    <View className="flex-1 flex-col space-y-5">
      {isCreating && (
        <Text className="text-xl font-sans-bold text-white">
          Enter Prompt Details
        </Text>
      )}

      <View>
        {!isCreating && setCategory && (
          <Select
            label="Category"
            items={categories.map((category) => ({
              label: category.name,
              value: category.name,
            }))}
            value={category}
            placeholder="Select category"
            setValue={setCategory}
            dropDownDirection="BOTTOM"
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
              indicatorStyle: "white",
            }}
          />
        )}

        <View className="-z-100">
          <Input
            value={promptText}
            onChangeText={setPromptText}
            label="Prompt text"
            className="mb-5"
            placeholder="e.g Are you feeling energetic?"
          />
          <Select
            label="Select response type"
            items={[
              { label: "Yes/No", value: "yesno" },
              { label: "Text", value: "text" },
              { label: "Number", value: "number" },
              { label: "Custom Options", value: "customOptions" },
            ]}
            value={responseType}
            placeholder="Select Response Type"
            setValue={setResponseType}
            dropDownDirection="BOTTOM"
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
              indicatorStyle: "white",
            }}
          />

          {responseType === "customOptions" ? (
            <View className="-z-10">
              <Input
                label="Enter your options"
                placeholder="Separate your values with ';'"
                value={customOptionsText}
                onChangeText={(text) => handleCustomOptionChange(text)}
              />
              {customOptions.length > 0 && (
                <View className="flex flex-row gap-x-2 gap-y-3 mt-3 flex-wrap">
                  {customOptions.map((option) => (
                    <Tag key={option} title={option} disabled />
                  ))}
                </View>
              )}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};
