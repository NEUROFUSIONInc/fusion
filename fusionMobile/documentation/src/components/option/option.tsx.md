The `src/components/option/option.tsx` file is a React component that defines an `Option` component, which appears to be an individual option item, possibly used in a list of options or a form setting.

### Content of `src/components/option/option.tsx`:

```tsx
import { FontAwesome } from "@expo/vector-icons";
import { FC, useState } from "react";
import { Pressable, Text } from "react-native";

import colors from "~/theme/colors";

export interface OptionProps {
  isChecked: boolean;
  text: string;
  onChange?: (value: boolean) => void;
}

export const Option: FC<OptionProps> = ({ onChange, text, isChecked }) => {
  const [checked, setChecked] = useState(isChecked);

  const onValueChange = () => {
    setChecked(!checked);
    onChange?.(!checked);
  };

  return (
    <Pressable
      className={`flex flex-row items-center justify-start rounded-md w-full h-12 border-2 ${
        checked ? "border-white" : "border-gray-400"
      }`}
      onPress={onValueChange}
    >
      <FontAwesome
        size={14}
        name={checked ? "check-circle" : "circle-o"}
        color="white"
        style={{
          marginHorizontal: 10,
          borderColor: checked ? "white" : colors.light,
          backgroundColor: "transparent",
          color: checked ? "white" : colors.light,
        }}
      />
      <Text
        className={`font-sans text-base ${
          checked ? "text-white" : `text-gray-400`
        }`}
      >
        {text}
      </Text>
    </Pressable>
  );
};
```

### Explanation:

- **Import Statements:**
  - The `FontAwesome` icon set is imported from `@expo/vector-icons`, which is likely used for displaying icons next to the option text.
  - React hooks and components `FC` (Functional Component), `useState`, `Pressable`, and `Text` are imported from relevant packages.

- **Component Definition:**
  - `OptionProps`: An interface defining the expected props:
    - `isChecked`: A boolean indicating if the option is selected.
    - `text`: The text content displayed for the option.
    - `onChange`: An optional function to handle change events.
  - `Option`: A functional component that utilizes `OptionProps`.

- **Component State:**
  - `checked`: A state variable initialized with `isChecked` which represents the current selection status of the option.

- **Event Handlers:**
  - `onValueChange`: A function that toggles the `checked` state and invokes the `onChange` callback with the new state.

- **Rendering:**
  - A `Pressable` (touchable) container that adjusts styling based on whether the option is checked.
  - It includes a FontAwesome icon to visually indicate the checked state (`"check-circle"`) or unchecked state (`"circle-o"`).
  - The `Text` component displays the provided `text` prop alongside the icon. The text color changes based on the `checked` state.

### Usage:

This `Option` component can be used to represent selectable items, such as checkboxes, within a form or settings menu. The icon provides a visual cue to the user for the selection, and tapping the option triggers a state change that can be detected via the `onChange` callback. The `isChecked` prop can be bound to external state management to control the component's checked status from parent components.