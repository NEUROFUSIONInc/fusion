import { ItemType, ValueType } from "react-native-dropdown-picker";

export const promptFrequencyData: ItemType<ValueType>[] = [
  {
    label: "Every 30 minutes",
    value: "30",
  },
  {
    label: "Every hour",
    value: "60",
  },
  {
    label: "Every two hours",
    value: "120",
  },
  {
    label: "Every three hours",
    value: "180",
  },
  {
    label: "Every four hours",
    value: "240",
  },
];
