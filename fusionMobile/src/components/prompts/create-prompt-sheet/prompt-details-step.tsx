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
}

export const PromptDetailsStep: FC<PromptDetailsStepProps> = ({
  promptText,
  setPromptText,
  responseType,
  setResponseType,
  customOptions,
  setCustomOptions,
}) => {
  const [customOptionsInputText, setCustomOptionsInputText] = useState("");

  return (
    <View className="flex-1 flex-col gap-y-5">
      <Text className="text-xl font-sans-bold text-white">
        Enter Prompt Details
      </Text>

      <View>
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
          <>
            <Input
              label="Enter your options"
              className="mb-5"
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

            {/* display the options as tags below */}
            {customOptions.length > 0 ? (
              <View className="flex flex-row gap-x-2 gap-y-3 flex-wrap">
                {customOptions.map((option) => (
                  <View key={option}>
                    <Tag key={option} title={option} disabled />
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
      </View>
    </View>
  );
};
