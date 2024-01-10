import { ReactNode } from "react";
import { KeyboardAvoidingView } from "react-native";

type Props = {
  children: ReactNode;
};

export const Screen = ({ children }: Props) => {
  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex flex-1 flex-col w-full h-full bg-dark px-2"
    >
      {children}
    </KeyboardAvoidingView>
  );
};
