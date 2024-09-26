import { NextApiRequest, NextApiResponse } from "next";
import { uploadToCeramic } from "~/services/storage.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    console.log("req body", await req.body);

    const entry = req.body;

    const result = await uploadToCeramic(entry);

    return res.status(201).json({ success: true, result });
  } catch (error) {
    console.error("Error uploading to Ceramic:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
