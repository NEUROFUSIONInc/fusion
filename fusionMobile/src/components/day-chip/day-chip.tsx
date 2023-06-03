import { VariantProps, cva } from "class-variance-authority";
import Checkbox, { CheckboxProps } from "expo-checkbox";
import { useState, forwardRef } from "react";
import { View, Text, Pressable } from "react-native";

const chipStyles = cva(
  "flex rounded-full relative active:opacity-75 bg-transparent border border-white items-center w-8 h-8 justify-center checked:border-none checked:bg-white checked:opacity-80 z-50",
  {
    variants: {
      checked: {
        true: "bg-white active:opacity-80",
      },
    },
  }
);

const textStyles = cva("font-sans text-white text-sm", {
  variants: {
    checked: {
      true: "text-dark",
    },
  },
});

export type DayChipProps = CheckboxProps &
  VariantProps<typeof chipStyles> & {
    day: string;
    isChecked: boolean;
    handleValueChange?: (value: boolean) => void;
  };

export const DayChip = forwardRef<Checkbox, DayChipProps>(
  ({ day, isChecked, handleValueChange, ...props }, ref) => {
    const [checked, setChecked] = useState(isChecked);
    const onValueChange = () => {
      setChecked(!checked);
      handleValueChange?.(!checked);
    };

    return (
      <Pressable className="relative w-8 h-8" onPress={onValueChange}>
        <Checkbox
          value={checked}
          className={chipStyles({ checked })}
          onValueChange={onValueChange}
          color={checked ? "white" : "transparent"}
          ref={ref}
          {...props}
        />
        <View
          className={`absolute z-50 inset-y-[0.1px] inset-x-[0.1px] w-8 h-8 flex items-center justify-center `}
        >
          <Text className={textStyles({ checked })}>
            {day.charAt(0).toUpperCase()}
          </Text>
        </View>
      </Pressable>
    );
  }
);
