import { Dispatch, FC, SetStateAction } from "react";
import { Text, View } from "react-native";

import { Tag } from "../../tag";

import { categories } from "~/config";

interface CategorySelectionStepProps {
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
}

export const CategorySelectionStep: FC<CategorySelectionStepProps> = ({
  setSelectedCategory,
  selectedCategory,
}) => {
  return (
    <View className="flex flex-1 flex-col items-start justify-center">
      <View className="flex-col gap-y-3">
        <Text className="text-xl font-sans-bold text-white">
          Select a category
        </Text>
        <Text className="text-base font-sans text-gray-400">
          Choose a category that best describes your prompt.
        </Text>
      </View>

      <View className="flex flex-row gap-2.5 space-y-2.5 flex-wrap py-5">
        {categories.map((category) => {
          const name = category.name;
          const isActive = name === selectedCategory;

          return (
            <Tag
              key={name}
              title={name}
              isActive={isActive}
              onPress={() => setSelectedCategory(name)}
            />
          );
        })}
      </View>
    </View>
  );
};
