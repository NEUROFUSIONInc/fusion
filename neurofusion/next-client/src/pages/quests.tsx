import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import React from "react";

import { authOptions } from "./api/auth/[...nextauth]";
import { DashboardLayout, Meta } from "~/components/layouts";
import { Button, Input } from "~/components/ui";

const QuestsPage: NextPage = () => {
  const [recepientNpubs, setRecepientNpubs] = React.useState<string>("");
  const [promptConfig, setPromptConfig] = React.useState<string>("");
  return (
    <DashboardLayout>
      <Meta
        meta={{
          title: "Fusion | Quests",
        }}
      />
      <div className="flex flex-col items-center justify-center w-full h-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100">Configure Quests</h1>
        <p className="mt-2 text-lg text-center text-gray-600 dark:text-gray-400"></p>

        <>
          <Input
            label="Recipient Fusion IDs"
            type="text"
            size="lg"
            fullWidth
            placeholder="Enter Recipient Fusion IDs"
            value={recepientNpubs}
            onChange={(e) => setRecepientNpubs(e.target.value)}
          />

          <Input
            label="Prompt Config"
            type="text"
            size="lg"
            fullWidth
            placeholder="Enter Prompt Config (JSON)"
            value={promptConfig}
            multiline
            className="pt-4 h-40"
            onChange={(e) => setPromptConfig(e.target.value)}
          />

          <Button type="submit" size="lg" fullWidth className="mt-4">
            Deploy
          </Button>
        </>
      </div>
    </DashboardLayout>
  );
};

export default QuestsPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};
