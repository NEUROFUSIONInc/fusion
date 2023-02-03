import { FC } from "react";

import { Logo } from "../../logo/logo";

import { LoginForm } from "./login-form";

interface LoginContainerProps {
  onSubmit: (email: string) => Promise<void>;
}

export const LoginContainer: FC<LoginContainerProps> = ({ onSubmit }) => {
  return (
    <div className="flex w-96 max-w-sm flex-col items-center space-y-6 rounded-md border bg-white py-12 px-4 shadow-md dark:border-secondary-400 dark:border-opacity-50 dark:bg-transparent dark:shadow-gray-700">
      <Logo className="w-16" />
      <h1 className="text-2xl font-bold">Login to Fusion</h1>
      <LoginForm onSubmit={onSubmit} />
    </div>
  );
};
