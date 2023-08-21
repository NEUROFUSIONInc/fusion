import fs from "fs";
import path from "path";
import { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "../api/auth/[...nextauth]";

export default function handler(req: any, res: any) {
  const {
    query: { file, id },
  } = req;

  const idRootMap: any = { "1": "src/components/lab/jspsych/psychometrics" };

  if (!(id in idRootMap)) res.status(404).json({ message: `invalid experiment ${id}` });

  const filePath = path.resolve(idRootMap[id], file.trim());
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: `${filePath} Doesnt Exist` });
    return;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  res.status(200).end(fileContent);
}

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
