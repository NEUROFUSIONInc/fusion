import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import { appInsights } from "~/utils/appInsights";
import { authService } from "~/services";
import { MainLayout, Meta } from "~/components/layouts";
import { Button, Input, Logo } from "~/components/ui";
import { getPrivateKey, persistPrivateKey } from "~/utils/auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { SeverityLevel } from "@microsoft/applicationinsights-web";

const LoginPage = React.memo(() => {
  const router = useRouter();
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showNostrExtensionLogin, setShowNostrExtensionLogin] = useState(false);

  useEffect(() => {
    // @ts-ignore
    setShowNostrExtensionLogin(global.window && "nostr" in global.window);
    // Check if there's a callback URL and automatically login
    if (router.query.callbackUrl) {
      (async () => {
        await useGuestAccount();
      })();
    }
  }, []);

  const useGuestAccount = async () => {
    try {
      appInsights.trackEvent({ name: "use_guest_account" });
      const privateKey = getPrivateKey();
      const { publicKey } = await persistPrivateKey(privateKey);
      completeNostrLogin(publicKey, privateKey);
    } catch (error) {
      console.error(error);
      appInsights.trackException({
        exception: new Error(error as string),
        severityLevel: SeverityLevel.Error,
        properties: {
          message: "Error using guest account",
        },
      });
    }
  };

  const useExtension = async () => {
    try {
      // @ts-ignore
      const nostr = global.window.nostr;
      if (nostr) {
        const publicKey = await nostr.getPublicKey();
        completeNostrLogin(publicKey, privateKey);
      } else {
        console.error("Nostr extension not installed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const useExistingAccount = async (privateKey: string) => {
    appInsights.trackEvent({ name: "use_existing_account", properties: { customProperty: "value" } });
    try {
      appInsights.trackEvent({ name: "use_existing_account" });
      if (privateKey.length !== 64) {
        return;
      }
      setPrivateKey(privateKey);
      const { publicKey } = await persistPrivateKey(privateKey);
      setPublicKey(publicKey);
    } catch (err) {
      appInsights.trackException({ error: new Error(err as string), severityLevel: SeverityLevel.Error });
      console.error(err);
    }
  };

  const completeNostrLogin = async (publicKey: string, privateKey?: string) => {
    const authObject = await authService.completeNostrLogin(publicKey, privateKey);

    if (authObject) {
      await signIn("credentials", {
        ...authObject,
        privateKey,
        redirect: true,
        callbackUrl: router.query.callbackUrl?.toString() ?? "/recordings",
      });
    } else {
      alert("Error logging in, please try again or reach out to contact@usefusion.app");
    }
  };

  return (
    <MainLayout>
      <Meta
        meta={{
          title: "Login | NeuroFusion Explorer",
        }}
      />
      <div className="mx-auto mt-16 flex w-full justify-center">
        <div className="m-4 flex w-96 max-w-sm flex-col items-center space-y-6 rounded-md border bg-white pt-12 pb-8 px-4 shadow-md dark:border-secondary-400 dark:border-opacity-50 dark:bg-transparent dark:shadow-sm dark:shadow-gray-700">
          <Logo className="w-16" />
          <h1 className="text-2xl font-bold">Login to Fusion</h1>
          <p className="w-full text-center mb-1">
            We're private by design
            <br />
            Get started with an anonymous account
          </p>
          <Button type="button" onClick={useGuestAccount} size="lg" fullWidth className="mt-4">
            Continue
          </Button>
          {showNostrExtensionLogin && (
            <Button type="button" onClick={useExtension} size="lg" fullWidth className="mt-4">
              Use Nostr Extension
            </Button>
          )}
          <a className="text-sm text-gray-500" onClick={() => setShowInput(!showInput)} href="#">
            Use Presaved Key
          </a>
          {showInput && (
            <div className="w-full flex flex-row self-center">
              <Input
                // className="text-center"
                size="lg"
                fullWidth
                placeholder="Paste Nostr Private Key"
                onChange={(e) => useExistingAccount(e.target.value)}
                value={privateKey}
              />
              <Button
                type="button"
                disabled={privateKey.length !== 64}
                onClick={() => completeNostrLogin(publicKey, privateKey)}
                size="lg"
                fullWidth
                className="w-[30%] ml-2 h-full"
              >
                Continue
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
});

export default LoginPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: "/recordings",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};
