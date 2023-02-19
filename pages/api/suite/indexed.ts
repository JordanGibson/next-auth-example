import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import omit from '../../../utils/omit';
import prisma from "../../../client";

export type IndexedSuitesResponseType = IndexedSuite[];

export type IndexedSuite = {
    id: string;
    name: string;
    isFavourite: boolean;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await unstable_getServerSession(req, res, authOptions);

    if (session) {
        const favourites = await prisma.suite.findMany({
            select: {
                id: true,
                name: true,
                suite_favourite: {
                    where: {
                        user_id: session.user.id,
                    },
                    select: {
                        user_id: true,
                    },
                },
            },
            where: {
                index: true,
            },
        });
        const modifiedSuites: IndexedSuitesResponseType = favourites.map((suite): IndexedSuite => {
            return {
                ...omit(suite, 'suite_favourite'), // spread the existing properties of the suite object
                isFavourite: suite.suite_favourite?.length !== 0,
            };
        });

        res.json(modifiedSuites);
        return;
    }

    const suites = await prisma.suite.findMany({
        where: {
            index: true,
        },
    });
    res.json(suites);
};

export default handler;
