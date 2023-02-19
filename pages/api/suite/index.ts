import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { suite } from '@prisma/client';
import prisma from '../../../client';

export type SuiteResponseType = suite & {
    isFavourite: boolean;
};

function pickFields<T, K extends keyof T>(obj: T, ...fields: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const field of fields) {
        result[field] = obj[field];
    }
    return result;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await unstable_getServerSession(req, res, authOptions);

    if (session) {
        const favourites = await prisma.suite.findMany({
            select: {
                id: true,
                name: true,
                index: true,
                suite_favourite: {
                    where: {
                        user_id: session.user.id,
                    },
                    select: {
                        user_id: true,
                    },
                },
            },
        });
        const modifiedSuites = favourites.map(suite => {
            return {
                ...pickFields(suite, 'id', 'name', 'index'), // spread the existing properties of the suite object
                isFavourite: suite.suite_favourite.length != 0,
            };
        });

        res.send(modifiedSuites);
        return;
    }

    const suites = await prisma.suite.findMany();
    res.send(suites);
};

export default handler;
