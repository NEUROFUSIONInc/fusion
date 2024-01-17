import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import { getPublicKey } from "nostr-tools";

import { authService } from "~/services";
import { MainLayout, Meta } from "~/components/layouts";
import { Button, Input, Logo } from "~/components/ui";
import { PRIVATE_KEY, getPrivateKey } from "~/utils/auth";

import { authOptions } from "../api/auth/[...nextauth]";

const LoginPage = () => {
  const router = useRouter();
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // @ts-ignore
        const nostr = window.nostr;
        if (nostr) {
          const publicKey = await nostr.getPublicKey();
          setPublicKey(publicKey);
        } else {
          const privateKey = getPrivateKey();
          updateKeys(privateKey);
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const updateKeys = (privateKey: string) => {
    if (privateKey && privateKey.length === 64) {
      localStorage.setItem(PRIVATE_KEY, privateKey);
      setPrivateKey(privateKey);
      const publicKey = getPublicKey(privateKey);
      setPublicKey(publicKey);
    } else {
      // TODO: render error message
      alert("Invalid private key");
    }
  };

  const onSubmit = async (publicKey: string, privateKey?: string) => {
    const authObject = await authService.completeNostrLogin(publicKey, privateKey);

    console.log(authObject);
    if (authObject) {
      await signIn("credentials", {
        ...authObject,
        privateKey,
        redirect: true,
        callbackUrl: router.query.callbackUrl?.toString(),
      });
    } else {
      // TODO: render error message
      alert("Error logging in");
    }
  };

  return (
    <MainLayout>
      <Meta
        meta={{
          title: "Fusion | Login",
        }}
      />
      <div className="mx-auto mt-16 flex w-full justify-center">
        <div className="m-4 flex w-96 max-w-sm flex-col items-center space-y-6 rounded-md border bg-white pt-12 pb-8 px-4 shadow-md dark:border-secondary-400 dark:border-opacity-50 dark:bg-transparent dark:shadow-sm dark:shadow-gray-700">
          <Logo className="w-16" />
          <h1 className="text-2xl font-bold">Login to Fusion</h1>
          {privateKey && (
            <div className="w-full">
              <p className="w-full text-center mb-1">We're private by design. Get started with an anonymous account!</p>
              <Input
                type={showInput ? "" : "hidden"}
                size="lg"
                fullWidth
                placeholder="Enter Private Key"
                onChange={(e) => updateKeys(e.target.value)}
                value={privateKey}
              />
            </div>
          )}
          <Button type="button" onClick={() => onSubmit(publicKey, privateKey)} size="lg" fullWidth className="mt-4">
            Get Started
          </Button>
          <a className="text-sm text-gray-500" onClick={() => setShowInput(!showInput)} href="#">
            use existing account key
          </a>
        </div>
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
        destination: "/playground",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};
