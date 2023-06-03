import { cva, type VariantProps } from "class-variance-authority";
import { FC } from "react";
import { Pressable, PressableProps, Text, View } from "react-native";

const buttonStyles = cva(
  "flex self-start bg-transparent border-2 border-gray-400 rounded-full relative disabled:opacity-70 items-center w-auto justify-center min-w-max p-4 active:opacity-80",
  {
    variants: {
      active: {
        true: "border-lime",
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

const buttonTextStyles = cva("font-sans text-gray-400 text-base", {
  variants: {
    active: {
      true: "text-lime",
    },
  },
});

export type TagProps = PressableProps &
  VariantProps<typeof buttonStyles> & {
    title: string;
    icon?: React.ReactNode;
  };

export const Tag: FC<TagProps> = ({
  title,
  active,
  disabled,
  fullWidth,
  icon,
  ...props
}) => (
  <View>
    <Pressable
      className={buttonStyles({ disabled, active, fullWidth })}
      disabled={disabled}
      {...props}
    >
      {icon && <View className="mr-2">{icon}</View>}
      <Text className={buttonTextStyles({ active })}>{title}</Text>
    </Pressable>
  </View>
);
