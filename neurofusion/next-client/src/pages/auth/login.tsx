import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { Magic } from "magic-sdk";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

import { authOptions } from "../api/auth/[...nextauth]";

const magic = typeof window !== "undefined" && new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || "a");

interface FormValue {
  email: string;
}

const LoginPage = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm<FormValue>();

  const onSubmit = async ({ email }: FormValue) => {
    if (!magic) throw new Error(`magic not defined`);

    const didToken = await magic.auth.loginWithMagicLink({ email });

    await signIn("credentials", {
      didToken,
      redirect: true,
      callbackUrl: router.query.callbackUrl?.toString(),
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("email", { required: true })}
          className="border"
          placeholder="valid email address"
          autoComplete="email"
        />

        <button type="submit">Sign in</button>
      </form>
    </div>
  );
};

export default LoginPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};
