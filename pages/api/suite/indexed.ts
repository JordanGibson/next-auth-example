import {NextApiRequest, NextApiResponse} from "next";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "../auth/[...nextauth]";
import omit from "../../../utils/omit";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await unstable_getServerSession(req, res, authOptions);

    if (session) {
        const favourites = (await prisma.suite.findMany({
            select: {
                id: true,
                name: true,
                suite_favourite: {
                    where: {
                        user_id: session.user.id
                    },
                    select: {
                        user_id: true
                    }
                },
            },
            where: {
                index: true
            }
        }));
        const modifiedSuites = favourites.map(suite => {
            return {
                ...omit(suite, 'suite_favourite'), // spread the existing properties of the suite object
                isFavourite: suite.suite_favourite?.length !== 0,
            };
        });

        res.send(modifiedSuites);
        return;
    }

    const suites = await prisma.suite.findMany({
        where: {
            index: true
        }
    });
    res.send(suites);
};

export default handler;
