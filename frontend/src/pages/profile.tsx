import React, { FC } from "react";
import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import { useSession, signOut } from "next-auth/react";
import { appInsights } from "~/utils/appInsights";
import { authOptions } from "./api/auth/[...nextauth]";
import { DashboardLayout, Meta } from "~/components/layouts";
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle } from "~/components/ui";
import { deletePrivateKey } from "~/utils/auth";
import Link from "next/link";
import StripeButton from "~/components/stripe-button";

const AccountPage: NextPage = () => {
  const { data: session } = useSession();
  const [confirmDeleteAccount, setConfirmDeleteAccount] = React.useState(false);

  const deleteAccount = () => {
    appInsights.trackEvent({ name: 'customEventName', properties: { customProperty: 'value' } });
    deletePrivateKey();
    signOut();
  };

  return (
    <DashboardLayout>
      <Meta
        meta={{
          title: "Profile | NeuroFusion Explorer",
          description: "Your account profile. You have been assigned an anonymous account.",
        }}
      />
      <h1 className="text-4xl">Profile</h1>
      <p className="mb-10 mt-2 text-lg dark:text-slate-400">You have been assigned an anonymous account</p>

      <p>Public Key : {session?.user?.name}</p>
      <p>Private Key: {session?.user?.privateKey} </p>

      <div className="flex flex-row space-x-4 mt-5">
        <Button onClick={() => signOut()}>Log Out</Button>
        <Button intent="ghost" onClick={() => setConfirmDeleteAccount(true)}>
          Delete Account
        </Button>
        <DeleteAccountModal
          confirmDeleteAccount={confirmDeleteAccount}
          setConfirmDeleteAccount={setConfirmDeleteAccount}
          deleteAccount={deleteAccount}
        />
      </div>

      <div>
        <p className="mt-5">Fusion is open source. Fund our development!</p>
        <StripeButton />
      </div>
    </DashboardLayout>
  );
};

export default AccountPage;

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

interface IDeleteAccountModalProps {
  confirmDeleteAccount: boolean;
  setConfirmDeleteAccount: (value: boolean) => void;
  deleteAccount: () => void;
}

export const DeleteAccountModal: FC<IDeleteAccountModalProps> = ({
  confirmDeleteAccount,
  setConfirmDeleteAccount,
  deleteAccount,
}) => {
  return (
    <Dialog open={confirmDeleteAccount} onOpenChange={() => setConfirmDeleteAccount(!confirmDeleteAccount)}>
      <DialogContent>
        <DialogTitle>Confirm Delete Account</DialogTitle>
        <DialogDescription>This will delete your private key. Are you sure you want to contiue?</DialogDescription>
        <Button intent="dark" onClick={deleteAccount}>
          Delete Account
        </Button>
      </DialogContent>
    </Dialog>
  );
};
