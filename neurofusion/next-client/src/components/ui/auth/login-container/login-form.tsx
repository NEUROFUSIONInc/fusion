import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "../../button/button";
import { Input } from "../../input/input";

import { getEventHash, getSignature, generatePrivateKey, getPublicKey, nip19, nip04, relayInit } from "nostr-tools";

const validationSchema = z.object({
  // email: z.string().min(1, "Email is required").email("Invalid email address"),
  privateKey: z.string().min(64, "Private key is required"),
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

  const handleOnSubmit = async ({ privateKey }: FormValues) => {
    await onSubmit(privateKey);
  };

  const privateKey = generatePrivateKey();

  return (
    <form onSubmit={handleSubmit(handleOnSubmit)} className="w-full">
      <p className="w-full text-center mb-1">
        We don't do emails here. We take your privacy seriously. Get started with an anonymous account!
      </p>

      {/* TODO: drop down to enter your nostr private key */}

      <Input
        error={errors.privateKey?.message}
        type="hidden"
        size="lg"
        fullWidth
        placeholder="Enter Private Key"
        value={privateKey}
        {...register("privateKey")}
      />
      {/*<Button type="submit" size="lg" fullWidth disabled={Boolean(errors.email)} className="mt-4">
        Continue with Email
      </Button> */}
      <Button type="submit" size="lg" fullWidth className="mt-4">
        Get started
      </Button>
    </form>
  );
};
