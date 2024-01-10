import { cva, type VariantProps } from "class-variance-authority";
import { FC, useEffect, useState } from "react";
import { Pressable, PressableProps, Text } from "react-native";

const tagStyles = cva(
  "flex self-start flex-row bg-transparent border-2 border-gray-400 rounded-full relative disabled:opacity-70 items-center w-auto justify-center min-w-max px-4 py-2 active:opacity-80",
  {
    variants: {
      active: {
        true: "border-transparent bg-tint",
      },
      disabled: {
        true: "opacity-70",
      },
      fullWidth: {
        true: "w-full",
      },
    },
  }
);

const tagTextStyles = cva("font-sans text-gray-400 text-base", {
  variants: {
    active: {
      true: "text-white",
    },
  },
});

export type CategoryTagProps = PressableProps &
  VariantProps<typeof tagStyles> & {
    isActive?: boolean;
    title: string;
    icon?: React.ReactNode;
    handleValueChange?: (value: boolean) => void;
  };

export const CategoryTag: FC<CategoryTagProps> = ({
  title,
  isActive,
  disabled,
  fullWidth,
  icon,
  handleValueChange,
  ...props
}) => {
  const [active, setActive] = useState(isActive);
  const onValueChange = () => {
    const newActive = !active;
    setActive(newActive);
    handleValueChange?.(newActive);
  };

  useEffect(() => {
    setActive(isActive);
  }, [isActive]);

  return (
    <Pressable
      className={tagStyles({ disabled, active, fullWidth })}
      disabled={disabled}
      onPress={onValueChange}
      {...props}
    >
      {icon && <Text className="mr-2">{icon}</Text>}
      <Text className={tagTextStyles({ active })}>{title}</Text>
    </Pressable>
  );
};
