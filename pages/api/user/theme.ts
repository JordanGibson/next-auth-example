import { NextApiRequest, NextApiResponse } from "next";
import { booleanLiteral } from "@babel/types";
import {unstable_getServerSession} from "next-auth/next";
import {authOptions} from "../auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case "PUT":
            await put(req, res);
            break;
        default:
            res.setHeader('Allow', ['PUT'])
            res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}

async function put(req: NextApiRequest, res: NextApiResponse) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { id, theme } = req.body;
    const response = await prisma.user.update({
        where: {
            id,
        },
        data: {
            theme,
        },
    });
    res.status(200).json(response);
}