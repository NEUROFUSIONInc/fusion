import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "../../button/button";
import { Input } from "../../input/input";

const validationSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});
type FormValues = z.infer<typeof validationSchema>;

interface LoginFormProps {
  onSubmit: (email: string) => Promise<void>;
}

export const LoginForm: FC<LoginFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
  });

  const handleOnSubmit = async ({ email }: FormValues) => {
    await onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit(handleOnSubmit)} className="w-full">
      <Input
        error={errors.email?.message}
        type="email"
        size="lg"
        fullWidth
        placeholder="Enter Valid Email"
        {...register("email")}
      />
      <Button type="submit" size="lg" fullWidth disabled={Boolean(errors.email)} className="mt-4">
        Continue with Email
      </Button>
    </form>
  );
};
