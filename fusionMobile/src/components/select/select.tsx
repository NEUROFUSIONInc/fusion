import { Entypo } from "@expo/vector-icons";
import React, { FC, useState } from "react";
import DropDownPicker, {
  DropDownPickerProps,
  ValueType,
} from "react-native-dropdown-picker";

type PickerProps = Omit<
  DropDownPickerProps<ValueType>,
  "open" | "setOpen" | "multiple"
> & {
  multiple?: boolean;
};

export const Select: FC<PickerProps> = ({
  items,
  value,
  setValue,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  multiple = false,
  ...props
}) => {
  const light = "rgba(255, 255, 255, 0.50)";
  const separatorColor = "rgba(255, 255, 255, 0.07)";
  const [open, setOpen] = useState(false);
  const [dropdownItems, setDropdownItems] = useState(items);

  return (
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
        color: light,
        fontFamily: "wsh-reg",
        fontSize: 16,
      }}
      ArrowUpIconComponent={() => (
        <Entypo name="chevron-small-up" size={18} color={light} />
      )}
      ArrowDownIconComponent={() => (
        <Entypo name="chevron-small-down" size={18} color={light} />
      )}
      dropDownContainerStyle={{
        backgroundColor: "#23212D",
        borderWidth: 0,
        marginTop: 18,
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
      TickIconComponent={() => <Entypo name="check" size={18} color="white" />}
      listItemContainerStyle={{
        height: 49,
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
        borderColor: light,
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
  );
};
