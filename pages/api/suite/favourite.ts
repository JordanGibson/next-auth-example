import { NextApiRequest, NextApiResponse } from 'next';
import { Session, unstable_getServerSession } from 'next-auth';
import prisma from '../../../client';
import { authOptions } from '../auth/[...nextauth]';

export type PutFavouriteSuiteRequestType = {
    suite: string;
    isFavourite: boolean;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (session) {
        switch (req.method) {
            case 'PUT':
                await put(req, res, session);
                break;
            default:
                res.setHeader('Allow', ['PUT']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } else {
        res.status(401).end('401 Unauthorized');
    }
}

async function put(req: NextApiRequest, res: NextApiResponse, session: Session) {
    const { suite, isFavourite } = req.body;
    const suite_id_user_id = {
        suite_id: suite,
        user_id: session.user.id!,
    };
    const response = isFavourite
        ? await prisma.suite_favourite.create({
              data: suite_id_user_id,
          })
        : await prisma.suite_favourite.delete({
              where: {
                  suite_id_user_id,
              },
          });
    res.status(200).json(response);
}
