import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const suites = await prisma.suite.findMany();
  res.send(suites);
};

export default handler;
