import { NextApiRequest, NextApiResponse } from 'next';
import moment from 'moment';
import {build_state, confidence_level} from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            await get(req, res);
            break;
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export type SuiteSummary = {
    confidence_level: confidence_level;
    id: number;
    state: build_state;
    status?: string;
    double_failures: string[];
    start_date?: number;
    end_date?: number;
    duration?: number;
}[];

async function get(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const builds = await prisma.build.findMany({
        where: {
            AND: {
                suite_id: id as string,
                build_details: {
                    start_date: {
                        gte: moment().subtract(10, 'days').toDate(),
                    },
                },
            },
        },
        select: {
            id: true,
            state: true,
            status: true,
            tenant: {
                select: {
                    confidence_level: true,
                },
            },
            build_double_failure: {
                select: {
                    test_class_name: true,
                },
            },
            build_details: {
                select: {
                    start_date: true,
                    end_date: true,
                    duration: true
                }
            }
        },
        orderBy: {
            build_details: {
                start_date: 'desc'
            }
        }
    });

    function flatten(rows: typeof builds): SuiteSummary {
        return rows.map(row => {
            return {
                id: row.id,
                state: row.state,
                status: row.status ?? undefined,
                confidence_level: row.tenant?.confidence_level ?? confidence_level.unknown,
                double_failures: row.build_double_failure.flatMap(x => x.test_class_name),
                start_date: row.build_details?.start_date?.getDate(),
                duration: row.build_details?.duration ?? undefined
            };
        });
    }
    res.json(flatten(builds));
}
