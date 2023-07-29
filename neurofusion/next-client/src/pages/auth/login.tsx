import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";

import { authOptions } from "../api/auth/[...nextauth]";

import { MainLayout, Meta } from "~/components/layouts";
import { LoginContainer } from "~/components/ui";
import { magic } from "~/lib";
import axios from "axios";

export var didTokenexp:any;

const LoginPage = () => {
  const router = useRouter();

  const onSubmit = async (email: string) => {
    if (!magic) throw new Error(`magic not defined`);

    const didToken = await magic.auth.loginWithMagicLink({ email });
    didTokenexp = didToken

    await signIn("credentials", {
      didToken,
      redirect: true,
      callbackUrl: router.query.callbackUrl?.toString(),
    });
    
    await userLoginComplete(email,didToken);
  };

  return (
    <MainLayout>
      <Meta
        meta={{
          title: "Neurofusion Login",
        }}
      />
      <div className="mx-auto mt-16 flex w-full justify-center">
        <LoginContainer onSubmit={onSubmit} />
      </div>
    </MainLayout>
  );
};

export default LoginPage;

export async function userLoginComplete(email:any, idToken:any) {
  const res = await axios.post(`${process.env.NEXT_PUBLIC_NEUROFUSION_BACKEND_URL}/api/userlogin`, {
      userEmail: email,
      magicLinkAuthToken: idToken
  });
  console.log(`${process.env.NEXT_PUBLIC_NEUROFUSION_BACKEND_URL}/api/userlogin`);


  if (res.status === 200) {
      // Simple but not the most secure way to store the token
      localStorage.setItem('token', res.data.body.authToken);
      return res.data;
  }
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: "/lab/integrations",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};
