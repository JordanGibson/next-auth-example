import { NextApiRequest, NextApiResponse } from "next";
import { booleanLiteral } from "@babel/types";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case "GET":
            await get(req, res);
            break;
        default:
            res.setHeader('Allow', ['GET', 'PUT'])
            res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}

async function get(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const builds = await prisma.build.findMany({
        where: {
            suite_id: id as string,
        },
        orderBy: {
            build_details: {
                end_date: "desc",
            }
        },
        include: {
            summary: true,
            build_details: true
        },
    });
    return res.json(builds);
}
