import { Entypo } from "@expo/vector-icons";
import React, { FC, useState } from "react";
import { Text } from "react-native";
import DropDownPicker, {
  DropDownPickerProps,
  ValueType,
} from "react-native-dropdown-picker";

import colors from "~/theme/colors";

type PickerProps = Omit<
  DropDownPickerProps<ValueType>,
  "open" | "setOpen" | "multiple"
> & {
  label?: string;
  multiple?: boolean;
};

export const Select: FC<PickerProps> = ({
  items,
  value,
  setValue,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  multiple = false,
  label,
  ...props
}) => {
  const separatorColor = "rgba(255, 255, 255, 0.07)";
  const [open, setOpen] = useState(false);
  const [dropdownItems, setDropdownItems] = useState(items);

  return (
    <>
      {label && (
        <Text className="text-white text-base font-sans mb-3">{label}</Text>
      )}
      <DropDownPicker
        value={value}
        items={dropdownItems}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        // @ts-ignore
        setValue={setValue as (value: ValueType | ValueType[] | null) => void}
        setItems={setDropdownItems}
        itemSeparator
        containerStyle={{
          height: 52,
          borderColor: "#E5E5E5",
          backgroundColor: "transparent",
        }}
        placeholderStyle={{
          color: colors.light,
          fontFamily: "wsh-reg",
          fontSize: 16,
        }}
        ArrowUpIconComponent={() => (
          <Entypo name="chevron-small-up" size={18} color={colors.light} />
        )}
        ArrowDownIconComponent={() => (
          <Entypo name="chevron-small-down" size={18} color={colors.light} />
        )}
        dropDownContainerStyle={{
          backgroundColor: "#23212D",
          borderColor: colors.light,
          borderWidth: 1,
          marginTop: 16,
          width: "100%",
          borderRadius: 6,
          zIndex: 100,
        }}
        listItemLabelStyle={{
          color: "white",
          fontFamily: "wsh-reg",
          fontSize: 16,
        }}
        searchTextInputStyle={{
          color: "white",
          fontFamily: "wsh-reg",
          fontSize: 16,
          borderColor: separatorColor,
          height: 40,
        }}
        searchContainerStyle={{
          borderBottomColor: separatorColor,
        }}
        searchTextInputProps={{
          placeholderTextColor: "white",
        }}
        TickIconComponent={() => (
          <Entypo name="check" size={18} color="white" />
        )}
        listItemContainerStyle={{
          height: 48,
        }}
        props={{
          activeOpacity: 0.8,
        }}
        labelStyle={{
          color: "white",
          fontFamily: "wsh-reg",
          fontSize: 16,
        }}
        style={{
          borderColor: colors.light,
          backgroundColor: "transparent",
        }}
        itemSeparatorStyle={{
          backgroundColor: separatorColor,
        }}
        multiple={multiple as true}
        {...props}
        open={open}
        setOpen={setOpen}
      />
    </>
  );
};
