import { Dispatch, FC, SetStateAction } from "react";
import { Text, View } from "react-native";

import { Input } from "../../input";
import { Select } from "../../select";

import { PromptResponseType } from "~/@types";

interface PromptDetailsStepProps {
  promptText: string;
  setPromptText: Dispatch<SetStateAction<string>>;
  responseType: PromptResponseType | null;
  setResponseType: Dispatch<SetStateAction<PromptResponseType | null>>;
}

export const PromptDetailsStep: FC<PromptDetailsStepProps> = ({
  promptText,
  setPromptText,
  responseType,
  setResponseType,
}) => {
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
          placeholder="e.g Are you feeling energetic "
        />
        <Select
          label="Select response type"
          items={[
            { label: "Text", value: "text" },
            { label: "Number", value: "number" },
            { label: "Yes/No", value: "yesno" },
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
      </View>
    </View>
  );
};
