import { Dispatch, FC, SetStateAction, useState } from "react";
import { Text, View } from "react-native";

import { Input } from "../../input";
import { Select } from "../../select";
import { Tag } from "../../tag";

import { PromptResponseType } from "~/@types";

interface PromptDetailsStepProps {
  promptText: string;
  setPromptText: Dispatch<SetStateAction<string>>;
  responseType: PromptResponseType | null;
  setResponseType: Dispatch<SetStateAction<PromptResponseType | null>>;
  customOptions: string[];
  setCustomOptions: Dispatch<SetStateAction<string[]>>;
  category: string | null;
  setCategory: Dispatch<SetStateAction<string | null>>;
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
  const [customOptionsInputText, setCustomOptionsInputText] = useState("");

  return (
    <View className="flex-1 flex-col space-y-5">
      {isCreating && (
        <Text className="text-xl font-sans-bold text-white">
          Enter Prompt Details
        </Text>
      )}

      <View>
        {!isCreating && (
          <Select
            label="Category"
            items={[
              { label: "Mental Health", value: "Mental Health" },
              { label: "Productivity", value: "Productivity" },
              { label: "Relationships", value: "Relationships" },
              { label: "Health and Fitness", value: "Health and Fitness" },
              { label: "Spiritual Practice", value: "Spiritual Practice" },
              { label: "Personal Interest", value: "Personal Interest" },
              { label: "Other", value: "Other" },
            ]}
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

        <View className="-z-30">
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
                value={customOptionsInputText}
                onChangeText={(text) => {
                  setCustomOptionsInputText(text);
                  const arr = text
                    .split(" ")
                    .join("")
                    .split(";")
                    .filter((str) => str !== "");
                  setCustomOptions(arr); // semicolon separated parsing into CustomOptions List
                }}
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
