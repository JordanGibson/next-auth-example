import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../client';
import {build, build_details, suite} from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            await get(req, res);
            break;
        case 'PUT':
            await put(req, res);
            break;
        default:
            res.setHeader('Allow', ['GET', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export type GetSuiteResponseType = suite;

async function get(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const suite: GetSuiteResponseType | null = await prisma.suite.findUnique({
        where: {
            id: id as string,
        },
    });
    res.json(suite);
}

async function put(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const { index } = req.body;
    console.log(index);
    const response = await prisma.suite.update({
        where: {
            id: id as string,
        },
        data: {
            index: index as boolean,
        },
    });
    console.log(response);
    res.status(200).json(response);
}
