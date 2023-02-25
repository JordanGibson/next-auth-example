import { NextApiRequest, NextApiResponse } from "next";
import { booleanLiteral } from "@babel/types";
import prisma from "../../../client";
import moment from "moment";
import {build, build_details} from "@prisma/client";

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

export type GetBuildsBySuiteIdResponseType = (build & {build_details: build_details})[]

async function get(req: NextApiRequest, res: NextApiResponse) {
    const { suiteId } = req.query;
    const builds: GetBuildsBySuiteIdResponseType = await prisma.build.findMany({
        where: {
            AND: {
                suite_id: suiteId as string,
                build_details: {
                    start_date: {
                        gt: moment().subtract(7, 'days').toDate()
                    }
                }
            }
        },
        orderBy: {
            build_details: {
                end_date: "desc",
            }
        },
        include: {
            build_details: true
        },
    });
    return res.json(builds);
}
