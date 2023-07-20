import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";

import { authOptions } from "../api/auth/[...nextauth]";

import { MainLayout } from "~/components/layouts";
import { LoginContainer } from "~/components/ui";
import { magic } from "~/lib";

const LoginPage = () => {
  const router = useRouter();

  const onSubmit = async (email: string) => {
    if (!magic) throw new Error(`magic not defined`);

    const didToken = await magic.auth.loginWithMagicLink({ email });

    await signIn("credentials", {
      didToken,
      redirect: true,
      callbackUrl: router.query.callbackUrl?.toString(),
    });
  };

  return (
    <MainLayout>
      <div className="mx-auto mt-16 flex w-full justify-center">
        <LoginContainer onSubmit={onSubmit} />
      </div>
    </MainLayout>
  );
};

export default LoginPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: "/integrations",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};
