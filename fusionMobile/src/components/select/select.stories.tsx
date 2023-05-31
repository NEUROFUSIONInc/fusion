import type { Meta } from "@storybook/react-native";
import { useState } from "react";
import { View } from "react-native";

import { Select } from "./select";

const meta: Meta<typeof Select> = {
  title: "ui/Select",
  component: Select,
};

export default meta;

export const SingleSelect = () => {
  const [items] = useState([
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
  ]);
  const [value, setValue] = useState(null);

  return (
    <View className="flex h-full p-4 bg-dark">
      <Select items={items} value={value} setValue={setValue} />
    </View>
  );
};

export const MultiSelect = () => {
  const [items] = useState([
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
  ]);
  const [value, setValue] = useState(null);

  return (
    <View className="flex h-full p-4 bg-dark">
      <Select items={items} value={value} setValue={setValue} multiple />
    </View>
  );
};

export const SearchableSelect = () => {
  const [items] = useState([
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Orange", value: "orange" },
    { label: "Pineapple", value: "pineapple" },
    { label: "Mango", value: "mango" },
    { label: "Grapes", value: "grapes" },
    { label: "Watermelon", value: "watermelon" },
    { label: "Strawberry", value: "strawberry" },
    { label: "Cherry", value: "cherry" },
    { label: "Peach", value: "peach" },
    { label: "Pear", value: "pear" },
    { label: "Papaya", value: "papaya" },
  ]);
  const [value, setValue] = useState(null);

  return (
    <View className="flex h-full p-4 bg-dark">
      <Select items={items} value={value} setValue={setValue} searchable />
    </View>
  );
};
